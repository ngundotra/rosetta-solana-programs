use anchor_lang::prelude::*;
use anchor_lang::solana_program;
use anchor_spl::associated_token;
use anchor_spl::token;
use std::convert::TryFrom;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[derive(Debug)]
#[account]
pub struct Counter {
    count: u64,
}

pub fn increment_handler(mut ctx: Context<Increment>) -> Result<()> {
    let mut counter = &mut ctx.accounts.counter;
    let mut owner = &mut ctx.accounts.owner;

    counter.count += 1;

    Ok(())
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        init,
        payer = owner,
        seeds = [owner.key().as_ref()],
        bump,
        space = 8 + std::mem::size_of::<Counter>()
    )]
    pub counter: Box<Account<'info, Counter>>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[program]
pub mod counter_seahorse {
    use super::*;

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        increment_handler(ctx)
    }
}
