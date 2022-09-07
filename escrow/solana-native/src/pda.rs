use solana_program::pubkey::Pubkey;

pub const ESCROW_PREFIX: &str = "escrow";

macro_rules! get_escrow_account_seeds {
    ($withdrawal_key: expr) => {
        &[
            &ESCROW_PREFIX.as_bytes(),
            &crate::id().as_ref(),
            &($withdrawal_key).as_ref(),
        ]
    };
    ($withdrawal_key: expr, $bump: ident) => {
        &[
            &ESCROW_PREFIX.as_bytes(),
            &crate::id().as_ref(),
            &($withdrawal_key).as_ref(),
            &[$bump],
        ]
    };
}

pub fn find_escrow_account(withdrawal_key: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(get_escrow_account_seeds!(withdrawal_key), &crate::id())
}
