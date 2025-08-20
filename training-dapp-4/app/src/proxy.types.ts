
import { ContractAbstractionFromContractType, WalletContractAbstractionFromContractType } from './type-utils';
import { address, BigMap, bytes } from './type-aliases';

export type Storage = {
    governance: address;
    entrypoints: BigMap<string, {
        method: string;
        addr: address;
    }>;
};

type Methods = {
    upgrade: (
        _0: Array<{
            name: string;
            isRemoved: boolean;
            entrypoint: {Some: {
                method: string;
                addr: address;
            }} | null;
        }>,
        oldAddr: address,
        newAddr: address,
    ) => Promise<void>;
    callContract: (
        entrypointName: string,
        payload: bytes,
    ) => Promise<void>;
};

export type UpgradeParams = Array<{
        name: string;
        isRemoved: boolean;
        entrypoint: {Some: {
            method: string;
            addr: address;
        }} | null;
    }>
export type CallContractParams = string

type MethodsObject = {
    upgrade: (params: {
        0: Array<{
            name: string;
            isRemoved: boolean;
            entrypoint: {Some: {
                method: string;
                addr: address;
            }} | null;
        }>,
        oldAddr: address,
        newAddr: address,
    }) => Promise<void>;
    callContract: (params: {
        entrypointName: string,
        payload: bytes,
    }) => Promise<void>;
};

type contractTypes = { methods: Methods, methodsObject: MethodsObject, storage: Storage, code: { __type: 'ProxyCode', protocol: string, code: object[] } };
export type ProxyContractType = ContractAbstractionFromContractType<contractTypes>;
export type ProxyWalletType = WalletContractAbstractionFromContractType<contractTypes>;
