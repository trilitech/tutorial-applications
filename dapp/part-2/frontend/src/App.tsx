import "./init";
import { NetworkType } from '@airgap/beacon-types';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';
import * as api from '@tzkt/sdk-api';
import { useEffect, useState } from 'react';
import './App.css';
import ConnectButton from './ConnectWallet';
import DisconnectButton from './DisconnectWallet';
import { type PokeGameWalletType } from './pokeGame.types';

function App() {
  api.defaults.baseUrl = 'https://api.ghostnet.tzkt.io';

  const [Tezos, setTezos] = useState<TezosToolkit>(
    new TezosToolkit('https://rpc.ghostnet.teztnets.com')
  );
  const [wallet, setWallet] = useState<BeaconWallet>(
    new BeaconWallet({
      name: 'Poke game',
      network: {
        type: NetworkType.GHOSTNET,
      }
    })
  );
  Tezos.setWalletProvider(wallet);

  useEffect(() => {
    (async () => {
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        setUserAddress(activeAccount.address);
        const balanceMutez = await Tezos.tz.getBalance(activeAccount.address);
        const balanceTez = balanceMutez.toNumber() / 10000000;
        setUserBalance(balanceTez);
      }
    })();
  }, []);

  const [userAddress, setUserAddress] = useState<string>('');
  const [balanceTez, setUserBalance] = useState<number>(0);
  const [contractToPoke, setContractToPoke] = useState<string>('');
  const [contracts, setContracts] = useState<Array<api.Contract>>([]);

  const fetchContracts = () => {
    (async () => {
      setContracts(
        await api.contractsGetSimilar(import.meta.env.VITE_CONTRACT_ADDRESS, {
          includeStorage: true,
          sort: { desc: 'id' },
        })
      );
    })();
  };

  const poke = async (
    e: React.FormEvent<HTMLFormElement>,
    contract: api.Contract
  ) => {
    e.preventDefault();
    let c: PokeGameWalletType = await Tezos.wallet.at('' + contract.address);
    try {
      const op = await c.methodsObject
        .pokeOtherContract(contractToPoke as address)
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
          {userAddress ?
              `I am ${userAddress} with ${balanceTez} tez`
            : `Click "Connect with wallet."`
          }
        </div>
        <br />
        <button onClick={fetchContracts}>Fetch contracts</button>
        <table>
          <thead>
            <tr>
              <th>Contract address</th>
              <th>Pokes and messages</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract) =>
            <tr>
              <td style={{ borderStyle: "dotted" }}>{contract.address}</td>
              <td style={{ borderStyle: "dotted" }}>{(contract.storage !== null && contract.storage.messages !== null && Object.entries(contract.storage.messages).length > 0) ? <ul>{Object.keys(contract.storage.messages).map((k: string) => <li style={{textAlign: "left" }}>{(contract.storage.messages[k] || "no message ") + " from " + k}</li>)}</ul> : ""}</td>
              <td style={{ borderStyle: "dotted" }}>
                <form onSubmit={(e) => poke(e, contract)}>
                  <input type="text" onChange={e => setContractToPoke(e.currentTarget.value)} placeholder='enter contract address here' />
                  <button type='submit'>Poke</button>
                </form>
              </td>
            </tr>)}
          </tbody>
        </table>
      </header>
    </div>
  );
}

export default App;
