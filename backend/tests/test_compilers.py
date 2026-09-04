import pytest
from src.api.exercise import validate_brackets, compile_code_sandbox

def test_validate_brackets_balanced():
    code = "function test() public { uint a = (1 + 2); }"
    assert validate_brackets(code) == []

def test_validate_brackets_unbalanced():
    code = "function test() public { uint a = (1 + 2; }"
    errors = validate_brackets(code)
    assert len(errors) > 0

def test_solidity_compiler_valid():
    valid_sol = '''
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;
    contract Counter {
        uint256 public count;
        function increment() public {
            count += 1;
        }
    }
    '''
    res = compile_code_sandbox(chain="arbitrum", language="solidity", code=valid_sol)
    assert res.success is True
    assert "solc" in res.compiler.lower()

def test_solidity_compiler_syntax_error():
    broken_sol = '''
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;
    contract Counter {
        uint256 public count
    }
    '''
    res = compile_code_sandbox(chain="arbitrum", language="solidity", code=broken_sol)
    assert res.success is False
    assert len(res.syntax_errors) > 0

def test_base_compiler_valid():
    valid_base = '''
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;
    contract BaseVault {
        address public owner;
    }
    '''
    res = compile_code_sandbox(chain="base", language="solidity", code=valid_base)
    assert res.success is True
    assert "base" in res.compiler.lower()

def test_optimism_compiler_valid():
    valid_op = '''
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;
    contract OptimismVault {
        string public network = "Optimism Superchain";
    }
    '''
    res = compile_code_sandbox(chain="optimism", language="solidity", code=valid_op)
    assert res.success is True
    assert "op" in res.compiler.lower() or "optimism" in res.compiler.lower()

def test_arbitrum_stylus_compiler_valid():
    valid_stylus = '''
    #![cfg_attr(not(feature = "export-abi"), no_main)]
    extern crate alloc;
    use stylus_sdk::prelude::*;

    sol_storage! {
        #[entrypoint]
        pub struct Counter {
            uint256 number;
        }
    }
    '''
    res = compile_code_sandbox(chain="stylus", language="rust", code=valid_stylus)
    assert res.success is True
    assert "stylus" in res.compiler.lower()

def test_solana_anchor_compiler_valid():
    valid_solana = '''
    use anchor_lang::prelude::*;
    declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

    #[program]
    pub mod basic_program {
        use super::*;
        pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
            Ok(())
        }
    }
    '''
    res = compile_code_sandbox(chain="solana", language="rust", code=valid_solana)
    assert res.success is True
    assert "anchor" in res.compiler.lower()

def test_aptos_move_compiler_valid():
    valid_move = '''
    module 0xcafe::counter {
        use std::signer;
        struct Counter has key { val: u64 }
        public entry fun init(account: &signer) {
            move_to(account, Counter { val: 0 });
        }
    }
    '''
    res = compile_code_sandbox(chain="aptos", language="move", code=valid_move)
    assert res.success is True
    assert "move" in res.compiler.lower()

def test_starknet_cairo_compiler_valid():
    valid_cairo = '''
    #[starknet::contract]
    mod HelloCairo {
        #[storage]
        struct Storage {
            name: felt252,
        }
    }
    '''
    res = compile_code_sandbox(chain="starknet", language="cairo", code=valid_cairo)
    assert res.success is True
    assert "cairo" in res.compiler.lower()

def test_polkadot_ink_compiler_valid():
    valid_ink = '''
    #![cfg_attr(not(feature = "std"), no_std)]
    #[ink::contract]
    mod flipper {
        #[ink(storage)]
        pub struct Flipper { value: bool }
        impl Flipper {
            #[ink(constructor)]
            pub fn new(initvalue: bool) -> Self { Self { value: initvalue } }
        }
    }
    '''
    res = compile_code_sandbox(chain="polkadot", language="rust", code=valid_ink)
    assert res.success is True
    assert "ink" in res.compiler.lower()
