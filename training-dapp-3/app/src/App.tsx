import { NetworkType } from '@airgap/beacon-types';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';
import * as api from '@tzkt/sdk-api';
import { BigNumber } from 'bignumber.js';
import { useEffect, useState } from 'react';
import './App.css';
import ConnectButton from './ConnectWallet';
import DisconnectButton from './DisconnectWallet';
import { PokeGameWalletType, Storage } from './pokeGame.types';
import { address, nat } from './type-aliases';

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
    Map<string, Storage>
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
      const taquitoContracts: Array<PokeGameWalletType> = await Promise.all(
        tzktcontracts.map(
          async (tzktcontract) =>
            (await Tezos.wallet.at(
              tzktcontract.address!
            )) as PokeGameWalletType
        )
      );
      const map = new Map<string, Storage>();
      for (const c of taquitoContracts) {
        const s: Storage = await c.storage();
        map.set(c.address, s);
      }
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
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    contract: api.Contract
  ) => {
    e.preventDefault();
    let c: PokeGameWalletType = await Tezos.wallet.at('' + contract.address);
    try {
      const op = await c.methodsObject
        .pokeAndGetFeedback(contractToPoke as address)
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
    let c: PokeGameWalletType = await Tezos.wallet.at('' + contract.address);
    try {
      console.log('contractToPoke', contractToPoke);
      const op = await c.methods
        .init(userAddress as address, new BigNumber(1) as nat)
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
      </header>

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
                <td style={{ borderStyle: 'dotted' }}>{contract.address}</td>
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
    </div>
  );
}

export default App;