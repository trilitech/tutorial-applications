
export const MockPokeContractCode: { __type: 'MockPokeContractCode', protocol: string, code: object[] } = {
    __type: 'MockPokeContractCode',
    protocol: 'PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo',
    code: JSON.parse(`[{"prim":"parameter","args":[{"prim":"or","args":[{"prim":"unit","annots":["%pokeMeBack"]},{"prim":"or","args":[{"prim":"address","annots":["%pokeOtherContract"]},{"prim":"or","args":[{"prim":"string","annots":["%pokeWithMessage"]},{"prim":"unit","annots":["%poke"]}]}]}]}]},{"prim":"storage","args":[{"prim":"pair","args":[{"prim":"map","annots":["%messages"],"args":[{"prim":"address"},{"prim":"string"}]},{"prim":"string","annots":["%feedback"]}]}]},{"prim":"code","args":[[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]],{"prim":"IF_LEFT","args":[[{"prim":"DROP"}],[{"prim":"IF_LEFT","args":[[{"prim":"DROP"}],[{"prim":"IF_LEFT","args":[[{"prim":"DROP"}],[{"prim":"DROP"}]]}]]}]]},{"prim":"NIL","args":[{"prim":"operation"}]},{"prim":"PAIR"}]]}]`)
};
