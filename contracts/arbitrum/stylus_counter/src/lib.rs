#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;
use stylus_sdk::{prelude::*, storage::StorageU256};

/// WASM-Compliant Arbitrum Stylus Smart Contract for Developer Academy Certification
#[storage]
#[entrypoint]
pub struct AcademyCounter {
    number_of_graduates: StorageU256,
}

#[public]
impl AcademyCounter {
    /// Returns the total count of certified graduates on Arbitrum Stylus
    pub fn get_graduates(&self) -> Result<u64, Vec<u8>> {
        Ok(self.number_of_graduates.get().as_u64())
    }

    /// Increments the graduate counter when a student completes certification
    pub fn increment_graduates(&mut self) -> Result<(), Vec<u8>> {
        let current = self.number_of_graduates.get();
        self.number_of_graduates.set(current + 1);
        Ok(())
    }
}
