use solana_program::{
    account_info::{next_account_info, AccountInfo},
    declare_id,
    entrypoint::ProgramResult,
    instruction::Instruction,
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use spl_memo::build_memo;

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

    // There is only 1 instruction, and we assume that the first
    // account is meant to be the signer
    let signer = next_account_info(account_info_iter)?;

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

    // There is only 1 instruction, and we assume that the first
    // account is meant to be the signer
    let signer = next_account_info(account_info_iter)?;

    // Log the pubkey that signed this instruction and message
    // It will have format like:
    // Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS: Hello world

    let memo_instruction = build_memo(instruction_data, &[&signer.key]);
    invoke(&memo_instruction, &[signer.clone()])?;
    Ok(())
}

/// ----------------------------------------------
/// This is function does *not* perform any on-chain logic
/// ----------------------------------------------
///
/// This function provides a way for other Rust libraries
/// to create a TransactionInstruction for this program (exposes an SDK)
pub fn wrap_instruction(data: Vec<u8>) -> Instruction {
    Instruction {
        program_id: crate::id(),
        accounts: vec![],
        data,
    }
}
