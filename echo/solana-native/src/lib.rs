use solana_program::{
    account_info::{next_account_info, AccountInfo},
    declare_id,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
};
use spl_memo::build_memo;

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
            msg!("Instruction: Echo Log");
            process_echo_log(accounts, instruction_data_inner)?;
        }
        1 => {
            msg!("Instruction: Echo Memo");
            process_echo_memo(accounts, instruction_data_inner)?;
        }
        2 => {
            msg!("Instruction: Echo Memo PDA Signer");
            process_echo_memo_pda_signer(accounts, instruction_data_inner)?;
        }
        _ => {
            msg!("Error: unknown instruction")
        }
    }
    Ok(())
}

pub fn process_echo_log(
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    // This is the standard way of accessing accounts passed to an on-chain program
    let account_info_iter = &mut accounts.iter();

    // The first account of this instruction is meant to be the signer
    let signer = next_account_info(account_info_iter)?;
    assert!(signer.is_signer, "First account must be a signer!");

    // Log the pubkey that signed this instruction and message
    // It will have format like:
    // Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS: Hello world
    msg!(
        "{}",
        format!(
            "{:?}: {}",
            signer.key,
            std::str::from_utf8(&instruction_data).unwrap()
        )
    );
    Ok(())
}

pub fn process_echo_memo(
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    // This is the standard way of accessing accounts passed to an on-chain program
    let account_info_iter = &mut accounts.iter();

    // The first account of this instruction is meant to be the signer
    let signer = next_account_info(account_info_iter)?;
    assert!(signer.is_signer, "First account must be a signer!");

    // Log the pubkey that signed this instruction and message
    // by invoking the spl-memo program
    let memo_instruction = build_memo(instruction_data, &[&signer.key]);
    invoke(&memo_instruction, &[signer.clone()])?;
    Ok(())
}

pub fn process_echo_memo_pda_signer(
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    // This is the standard way of accessing accounts passed to an on-chain program
    let account_info_iter = &mut accounts.iter();

    // The first account of this instruction is meant to be the signer
    let signer = next_account_info(account_info_iter)?;
    assert!(signer.is_signer, "First account must be a signer!");

    // The second account of this instruction is a PDA formed from specific seeds
    let pda_signer = next_account_info(account_info_iter)?;
    let message = std::str::from_utf8(instruction_data).unwrap();
    let (expected_pda_key, bump) = find_memo_signer_account(message.to_string());
    assert!(
        *pda_signer.key == expected_pda_key,
        "PDA key must be derived the same way as in `find_memo_signer_account` in pda.rs"
    );

    // Log the pubkey that signed this instruction and message
    // by invoking the spl-memo program
    let memo_instruction = build_memo(instruction_data, &[&signer.key, &pda_signer.key]);
    invoke_signed(
        &memo_instruction,
        &[signer.clone(), pda_signer.clone()],
        &[get_memo_signer_account_seeds!(message, bump)],
    )?;

    Ok(())
}
