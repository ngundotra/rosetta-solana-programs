use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_spl::associated_token;
use anchor_spl::token;
use std::convert::TryFrom;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub fn echo_handler(mut ctx: Context<Echo>, mut message: String) -> Result<()> {
    let mut signer = &mut ctx.accounts.signer;

    msg!("{}", format!("{:?}: {}", signer.key, message));

    Ok(())
}

#[derive(Accounts)]
# [instruction (message : String)]
pub struct Echo<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[program]
pub mod echo_seahorse {
    use super::*;

    pub fn echo(ctx: Context<Echo>, message: String) -> Result<()> {
        echo_handler(ctx, message)
    }
}
