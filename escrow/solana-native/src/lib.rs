use solana_program::{
    account_info::{next_account_info, AccountInfo},
    declare_id,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
};

#[macro_use]
mod pda;
use pda::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[cfg(not(feature = "no-entrypoint"))]
use solana_program::entrypoint;

#[cfg(not(feature = "no-entrypoint"))]
entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let (instruction_discriminant, instruction_data_inner) = instruction_data.split_at(1);
    match instruction_discriminant[0] {
        0 => {
            msg!("Instruction: Deposit Sol");
            process_deposit_sol(accounts, instruction_data_inner)?;
        }
        1 => {
            msg!("Instruction: Withdraw Sol");
            process_withdraw_sol(accounts, instruction_data_inner)?;
        }
        _ => {
            msg!("Error: unknown instruction")
        }
    }
    Ok(())
}

fn unpack_amount(input: &[u8]) -> Result<u64, ProgramError> {
    let amount = input
        .get(..8)
        .and_then(|slice| slice.try_into().ok())
        .map(u64::from_le_bytes)
        .ok_or(ProgramError::InvalidInstructionData)
        .map_err(|e| {
            msg!("Failed to unpack amount.");
            e
        })?;
    Ok(amount)
}

/// Deposits sol in an account owned by the PDA
pub fn process_deposit_sol(
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    let account_info_iter = &mut accounts.iter();

    let depositor = next_account_info(account_info_iter)?;
    assert!(depositor.is_signer, "Depositor account must be signer");
    assert!(depositor.is_writable, "Depositor account must be writable");

    let withdrawer = next_account_info(account_info_iter)?;

    let withdrawal_escrow = next_account_info(account_info_iter)?;
    assert!(
        withdrawal_escrow.is_writable,
        "Withdrawal account must be writable"
    );
    let (expected_pda_key, bump) = find_escrow_account(&withdrawer.key);
    assert!(
        *withdrawal_escrow.key == expected_pda_key,
        "PDA key must be derived the same way as in `find_escrow_account` in pda.rs"
    );

    let system_program_account = next_account_info(account_info_iter)?;

    let lamports_to_deposit: u64 = unpack_amount(instruction_data)?;

    invoke(
        &system_instruction::transfer(&depositor.key, &withdrawal_escrow.key, lamports_to_deposit),
        &[
            depositor.clone(),
            withdrawal_escrow.clone(),
            system_program_account.clone(),
        ],
    )?;

    msg!(
        "{:?} deposited {:?} lamports for {:?}",
        depositor.key.to_string(),
        withdrawal_escrow.lamports(),
        withdrawer.key.to_string()
    );
    Ok(())
}

pub fn process_withdraw_sol(
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    let account_info_iter = &mut accounts.iter();

    let withdrawer = next_account_info(account_info_iter)?;
    assert!(withdrawer.is_signer, "Withdrawer account must be signer!");
    assert!(
        withdrawer.is_writable,
        "Withdrawer account must be writable!"
    );

    let withdrawal_escrow = next_account_info(account_info_iter)?;
    assert!(
        withdrawal_escrow.is_writable,
        "Withdrawal escrow account must be writable!"
    );
    let (expected_pda_key, bump) = find_escrow_account(&withdrawer.key);
    assert!(
        *withdrawal_escrow.key == expected_pda_key,
        "PDA key must be derived the same way as in `find_escrow_account` in pda.rs"
    );

    let system_program_account = next_account_info(account_info_iter)?;

    let lamports_available = withdrawal_escrow.lamports();
    let mut lamports_to_withdraw: u64 = unpack_amount(instruction_data)?;
    lamports_to_withdraw = if lamports_available > lamports_to_withdraw {
        lamports_available
    } else {
        lamports_to_withdraw
    };

    invoke_signed(
        &system_instruction::transfer(
            &withdrawal_escrow.key,
            &withdrawer.key,
            lamports_to_withdraw,
        ),
        &[
            withdrawal_escrow.clone(),
            withdrawer.clone(),
            system_program_account.clone(),
        ],
        &[get_escrow_account_seeds!(withdrawer.key, bump)],
    )?;

    msg!(
        "{:?} withdrew {:?} lamports",
        withdrawer.key.to_string(),
        lamports_to_withdraw
    );

    Ok(())
}
