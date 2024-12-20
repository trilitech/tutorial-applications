import { NetworkType } from '@airgap/beacon-types';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { PackDataResponse } from '@taquito/rpc';
import { MichelCodecPacker, TezosToolkit } from '@taquito/taquito';
import * as api from '@tzkt/sdk-api';
import { useEffect, useState } from 'react';
import './App.css';
import ConnectButton from './ConnectWallet';
import DisconnectButton from './DisconnectWallet';
import {
  Storage as ContractStorage,
  PokeGameWalletType,
} from './pokeGame.types';
import { Storage as ProxyStorage, ProxyWalletType } from './proxy.types';
import { address, bytes } from './type-aliases';

function App() {
  api.defaults.baseUrl = 'https://api.ghostnet.tzkt.io';

  const [Tezos, setTezos] = useState<TezosToolkit>(
    new TezosToolkit('https://ghostnet.ecadinfra.com')
  );
  const [wallet, setWallet] = useState<BeaconWallet>(
    new BeaconWallet({
      name: 'Training',
      preferredNetwork: NetworkType.GHOSTNET,
    })
  );

  const [contracts, setContracts] = useState<Array<api.Contract>>([]);
  const [contractStorages, setContractStorages] = useState<
    Map<string, ProxyStorage & ContractStorage>
  >(new Map());

  const fetchContracts = () => {
    (async () => {
      const tzktcontracts: Array<api.Contract> =
        await api.contractsGetSimilar(
          import.meta.env.VITE_CONTRACT_ADDRESS,
          {
            includeStorage: true,
            sort: { desc: 'id' },
          }
        );
      setContracts(tzktcontracts);
      const taquitoContracts: Array<ProxyWalletType> = await Promise.all(
        tzktcontracts.map(
          async (tzktcontract) =>
            (await Tezos.wallet.at(tzktcontract.address!)) as ProxyWalletType
        )
      );
      const map = new Map<string, ProxyStorage & ContractStorage>();
      for (const c of taquitoContracts) {
        const s: ProxyStorage = await c.storage();
        try {
          let firstEp: { addr: address; method: string } | undefined =
            await s.entrypoints.get('Poke');

          if (firstEp) {
            let underlyingContract: PokeGameWalletType =
              await Tezos.wallet.at('' + firstEp!.addr);
            map.set(c.address, {
              ...s,
              ...(await underlyingContract.storage()),
            });
          } else {
            console.log(
              'proxy is not well configured ... for contract ' + c.address
            );
            continue;
          }
        } catch (error) {
          console.log(error);
          console.log(
            'final contract is not well configured ... for contract ' +
            c.address
          );
        }
      }
      console.log('map', map);
      setContractStorages(map);
    })();
  };

  useEffect(() => {
    (async () => {
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        setUserAddress(activeAccount.address);
        const balance = await Tezos.tz.getBalance(activeAccount.address);
        setUserBalance(balance.toNumber());
      }
    })();
  }, []);

  const [userAddress, setUserAddress] = useState<string>('');
  const [userBalance, setUserBalance] = useState<number>(0);
  const [contractToPoke, setContractToPoke] = useState<string>('');
  //poke
  const poke = async (
    e: React.MouseEvent<HTMLButtonElement>,
    contract: api.Contract
  ) => {
    e.preventDefault();
    let c: ProxyWalletType = await Tezos.wallet.at('' + contract.address);
    try {
      console.log('contractToPoke', contractToPoke);

      const p = new MichelCodecPacker();
      let contractToPokeBytes: PackDataResponse = await p.packData({
        data: { string: contractToPoke },
        type: { prim: 'address' },
      });
      console.log('packed', contractToPokeBytes.packed);

      const op = await c.methods
        .callContract(
          'PokeAndGetFeedback',
          contractToPokeBytes.packed as bytes
        )
        .send();
      await op.confirmation();
      alert('Tx done');
    } catch (error: any) {
      console.log(error);
      console.table(`Error: ${JSON.stringify(error, null, 2)}`);
    }
  };

  //mint
  const mint = async (
    e: React.MouseEvent<HTMLButtonElement>,
    contract: api.Contract
  ) => {
    e.preventDefault();
    let c: ProxyWalletType = await Tezos.wallet.at('' + contract.address);
    try {
      console.log('contractToPoke', contractToPoke);
      const p = new MichelCodecPacker();
      let initBytes: PackDataResponse = await p.packData({
        data: {
          prim: 'Pair',
          args: [{ string: userAddress }, { int: '1' }],
        },
        type: { prim: 'Pair', args: [{ prim: 'address' }, { prim: 'nat' }] },
      });
      const op = await c.methods
        .callContract('Init', initBytes.packed as bytes)
        .send();
      await op.confirmation();
      alert('Tx done');
    } catch (error: any) {
      console.log(error);
      console.table(`Error: ${JSON.stringify(error, null, 2)}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <ConnectButton
          Tezos={Tezos}
          setTezos={setTezos}
          setUserAddress={setUserAddress}
          setUserBalance={setUserBalance}
          wallet={wallet}
        />

        <DisconnectButton
          wallet={wallet}
          setUserAddress={setUserAddress}
          setUserBalance={setUserBalance}
        />

        <div>
          I am {userAddress} with {userBalance} mutez
        </div>

        <br />
        <div>
          <button onClick={fetchContracts}>Fetch contracts</button>
          <table>
            <thead>
              <tr>
                <th>address</th>
                <th>trace "contract - feedback - user"</th>
                <th>action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr>
                  <td style={{ borderStyle: 'dotted' }}>
                    {contract.address}
                  </td>
                  <td style={{ borderStyle: 'dotted' }}>
                    {contractStorages.get(contract.address!) !== undefined &&
                      contractStorages.get(contract.address!)!.pokeTraces
                      ? Array.from(
                        contractStorages
                          .get(contract.address!)!
                          .pokeTraces.entries()
                      ).map(
                        (e) =>
                          e[1].receiver +
                          ' ' +
                          e[1].feedback +
                          ' ' +
                          e[0] +
                          ','
                      )
                      : ''}
                  </td>
                  <td style={{ borderStyle: 'dotted' }}>
                    <input
                      type="text"
                      onChange={(e) => {
                        console.log('e', e.currentTarget.value);
                        setContractToPoke(e.currentTarget.value);
                      }}
                      placeholder="enter contract address here"
                    />
                    <button onClick={(e) => poke(e, contract)}>Poke</button>
                    <button onClick={(e) => mint(e, contract)}>
                      Mint 1 ticket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </header>
    </div>
  );
}
export default App;