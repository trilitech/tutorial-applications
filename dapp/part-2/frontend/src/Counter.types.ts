
import { ContractAbstractionFromContractType, WalletContractAbstractionFromContractType } from './type-utils';
import { int, unit } from './type-aliases';

export type Storage = int;

type Methods = {
    reset: () => Promise<void>;
    decrement: (param: int) => Promise<void>;
    increment: (param: int) => Promise<void>;
};

export type ResetParams = unit
export type DecrementParams = int
export type IncrementParams = int

type MethodsObject = {
    reset: () => Promise<void>;
    decrement: (param: int) => Promise<void>;
    increment: (param: int) => Promise<void>;
};

type contractTypes = { methods: Methods, methodsObject: MethodsObject, storage: Storage, code: { __type: 'CounterCode', protocol: string, code: object[] } };
export type CounterContractType = ContractAbstractionFromContractType<contractTypes>;
export type CounterWalletType = WalletContractAbstractionFromContractType<contractTypes>;
