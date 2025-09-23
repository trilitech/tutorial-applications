
import { ContractAbstractionFromContractType, WalletContractAbstractionFromContractType } from './type-utils';
import { address, MMap, ticket, unit } from './type-aliases';

export type Storage = {
    tickets: MMap<address, ticket>;
    messages: MMap<address, string>;
    feedback: string;
    admin: address;
};

type Methods = {
    createTicket: (param: address) => Promise<void>;
    pokeMeBack: (param: ticket) => Promise<void>;
    pokeOtherContract: (param: address) => Promise<void>;
    pokeWithMessage: (param: string) => Promise<void>;
    poke: () => Promise<void>;
};

export type CreateTicketParams = address
export type PokeMeBackParams = ticket
export type PokeOtherContractParams = address
export type PokeWithMessageParams = string
export type PokeParams = unit

type MethodsObject = {
    createTicket: (param: address) => Promise<void>;
    pokeMeBack: (param: ticket) => Promise<void>;
    pokeOtherContract: (param: address) => Promise<void>;
    pokeWithMessage: (param: string) => Promise<void>;
    poke: () => Promise<void>;
};

type contractTypes = { methods: Methods, methodsObject: MethodsObject, storage: Storage, code: { __type: 'PokeGameCode', protocol: string, code: object[] } };
export type PokeGameContractType = ContractAbstractionFromContractType<contractTypes>;
export type PokeGameWalletType = WalletContractAbstractionFromContractType<contractTypes>;
