use solana_program::{
    sysvar::{
        rent::Rent,
        Sysvar,
    },
};


pub fn lamports_required(span: usize) -> u64 {
    (Rent::get().unwrap()).minimum_balance(span)
}

pub fn size(span: usize) -> u64 {
    span.try_into().unwrap()
}