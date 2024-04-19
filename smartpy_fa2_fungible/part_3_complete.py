import smartpy as sp
from smartpy.templates import fa2_lib as fa2

# Alias the main template for FA2 contracts
main = fa2.main


@sp.module
def my_module():
    # Order of inheritance: [Admin], [<policy>], <base class>, [<other mixins>].
    class MyFungibleContract(
        main.Admin,
        main.Fungible,
        main.MintFungible,
        main.BurnFungible,
        main.OnchainviewBalanceOf,
    ):
        def __init__(self, admin_address, contract_metadata, ledger, token_metadata):

            # Initialize on-chain balance view
            main.OnchainviewBalanceOf.__init__(self)

            # Initialize the fungible token-specific entrypoints
            main.BurnFungible.__init__(self)
            main.MintFungible.__init__(self)

            # Initialize fungible token base class
            main.Fungible.__init__(self, contract_metadata, ledger, token_metadata)

            # Initialize administrative permissions
            main.Admin.__init__(self, admin_address)

def _get_balance(fa2_contract, args):
    """Utility function to call the contract's get_balance view to get an account's token balance."""
    return sp.View(fa2_contract, "get_balance")(args)


def _total_supply(fa2_contract, args):
    """Utility function to call the contract's total_supply view to get the total amount of tokens."""
    return sp.View(fa2_contract, "total_supply")(args)


@sp.add_test()
def test():
    # Create and configure the test scenario
    # Import the types from the FA2 library, the library itself, and the contract module, in that order.
    scenario = sp.test_scenario("fa2_lib_fungible", [fa2.t, fa2.main, my_module])

    # Define test accounts
    admin = sp.test_account("Admin")
    alice = sp.test_account("Alice")
    bob = sp.test_account("Bob")

    # Define initial token metadata
    tok0_md = fa2.make_metadata(name="Token Zero", decimals=0, symbol="Tok0")
    tok1_md = fa2.make_metadata(name="Token One", decimals=0, symbol="Tok1")

    # Define tokens and initial owners
    # ledger_fungible: type = sp.big_map[sp.pair[sp.address, sp.nat], sp.nat]
    initial_ledger = sp.map() # If I use big_map here it fails
    sp.cast(initial_ledger, fa2.t.ledger_fungible)
    initial_ledger = sp.update_map(sp.pair(alice.address, 0), sp.Some(10), initial_ledger)
    initial_ledger = sp.update_map(sp.pair(bob.address, 1), sp.Some(10), initial_ledger)

    # Instantiate the FA2 fungible token contract
    contract = my_module.MyFungibleContract(admin.address, sp.big_map(), initial_ledger, [tok0_md, tok1_md])

    # Build contract metadata content
    contract_metadata = sp.create_tzip16_metadata(
        name="My FA2 fungible token contract",
        description="This is an FA2 fungible token contract using SmartPy.",
        version="1.0.0",
        license_name="CC-BY-SA",
        license_details="Creative Commons Attribution Share Alike license 4.0 https://creativecommons.org/licenses/by/4.0/",
        interfaces=["TZIP-012", "TZIP-016"],
        authors=["SmartPy <https://smartpy.io/#contact>"],
        homepage="https://smartpy.io/ide?template=fa2_lib_fungible.py",
        # Optionally, upload the source code to IPFS and add the URI here
        source_uri=None,
        offchain_views=contract.get_offchain_views(),
    )

    # Add the info specific to FA2 permissions
    contract_metadata["permissions"] = {
        # The operator policy chosen:
        # owner-or-operator-transfer is the default.
        "operator": "owner-or-operator-transfer",
        # Those two options should always have these values.
        # It means that the contract doesn't use the hook mechanism.
        "receiver": "owner-no-hook",
        "sender": "owner-no-hook",
    }

    # Upload the metadata to IPFS and get its URI
    metadata_uri = sp.pin_on_ipfs(contract_metadata)

    # Create the metadata big map based on the IPFS URI
    contract_metadata = sp.scenario_utils.metadata_of_url(metadata_uri)

    # Update the scenario instance with the new metadata
    contract.data.metadata = contract_metadata

    # Originate the contract in the test scenario
    scenario += contract

    scenario.h2("Verify the initial owners of the tokens")
    scenario.verify(
        _get_balance(contract, sp.record(owner=alice.address, token_id=0)) == 10
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=bob.address, token_id=0)) == 0
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=alice.address, token_id=1)) == 0
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=bob.address, token_id=1)) == 10
    )
    scenario.verify(_total_supply(contract, sp.record(token_id=0)) == 10)
    scenario.verify(_total_supply(contract, sp.record(token_id=1)) == 10)

    scenario.h2("Transfer tokens")
    # Bob sends 3 of token 1 to Alice
    contract.transfer(
        [
            sp.record(
                from_=bob.address,
                txs=[sp.record(to_=alice.address, amount=3, token_id=1)],
            ),
        ],
        _sender=bob,
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=alice.address, token_id=0)) == 10
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=bob.address, token_id=0)) == 0
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=alice.address, token_id=1)) == 3
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=bob.address, token_id=1)) == 7
    )
    scenario.verify(_total_supply(contract, sp.record(token_id=0)) == 10)
    scenario.verify(_total_supply(contract, sp.record(token_id=1)) == 10)

    # Alice sends 4 of token 0 to Bob
    contract.transfer(
        [
            sp.record(
                from_=alice.address,
                txs=[sp.record(to_=bob.address, amount=4, token_id=0)],
            ),
        ],
        _sender=alice,
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=alice.address, token_id=0)) == 6
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=bob.address, token_id=0)) == 4
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=alice.address, token_id=1)) == 3
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=bob.address, token_id=1)) == 7
    )
    scenario.verify(_total_supply(contract, sp.record(token_id=0)) == 10)
    scenario.verify(_total_supply(contract, sp.record(token_id=1)) == 10)

    # Bob cannot transfer Alice's tokens
    contract.transfer(
        [
            sp.record(
                from_=alice.address,
                txs=[sp.record(to_=bob.address, amount=1, token_id=0)],
            ),
        ],
        _sender=bob,
        _valid=False,
    )

    scenario.h2("Mint tokens")

    # Mint more of an existing token
    contract.mint(
        [
            sp.record(to_=alice.address, amount=4, token=sp.variant("existing", 0)),
            sp.record(to_=bob.address, amount=4, token=sp.variant("existing", 1)),
        ],
        _sender=admin,
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=alice.address, token_id=0)) == 10
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=bob.address, token_id=0)) == 4
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=alice.address, token_id=1)) == 3
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=bob.address, token_id=1)) == 11
    )
    scenario.verify(_total_supply(contract, sp.record(token_id=0)) == 14)
    scenario.verify(_total_supply(contract, sp.record(token_id=1)) == 14)

    # Other users can't mint tokens
    contract.mint(
        [
            sp.record(to_=alice.address, amount=4, token=sp.variant("existing", 0)),
        ],
        _sender=alice,
        _valid=False
    )

    # Create a token type
    tok2_md = fa2.make_metadata(name="Token Two", decimals=0, symbol="Tok2")
    contract.mint(
        [
            sp.record(to_=alice.address, amount=5, token=sp.variant("new", tok2_md)),
        ],
        _sender=admin,
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=alice.address, token_id=2)) == 5
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=bob.address, token_id=2)) == 0
    )

    scenario.h2("Burn tokens")
    # Verify that you can burn your own token
    contract.burn([sp.record(token_id=2, from_=alice.address, amount=1)], _sender=alice)
    scenario.verify(
        _get_balance(contract, sp.record(owner=alice.address, token_id=2)) == 4
    )
    # Verify that you can't burn someone else's token
    contract.burn(
        [sp.record(token_id=2, from_=alice.address, amount=1)],
        _sender=bob,
        _valid=False,
    )
    scenario.verify(
        _get_balance(contract, sp.record(owner=alice.address, token_id=2)) == 4
    )
    scenario.verify(
        _total_supply(contract, sp.record(token_id=2)) == 4
    )
