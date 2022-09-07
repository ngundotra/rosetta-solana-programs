use solana_program::pubkey::Pubkey;

pub const MEMO_PREFIX: &str = "memo";

macro_rules! get_memo_signer_account_seeds {
    ($message: ident) => {
        &[
            &MEMO_PREFIX.as_bytes(),
            &crate::id().as_ref(),
            &($message).as_bytes(),
        ]
    };
    ($message: ident, $bump: ident) => {
        &[
            &MEMO_PREFIX.as_bytes(),
            &crate::id().as_ref(),
            &($message).as_bytes(),
            &[$bump],
        ]
    };
}

pub fn find_memo_signer_account(message: String) -> (Pubkey, u8) {
    Pubkey::find_program_address(get_memo_signer_account_seeds!(message), &crate::id())
}
