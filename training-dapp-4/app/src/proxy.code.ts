
export const ProxyCode: { __type: 'ProxyCode', protocol: string, code: object[] } = {
    __type: 'ProxyCode',
    protocol: 'PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo',
    code: JSON.parse(`[{"prim":"parameter","args":[{"prim":"or","args":[{"prim":"pair","annots":["%upgrade"],"args":[{"prim":"list","args":[{"prim":"pair","args":[{"prim":"string","annots":["%name"]},{"prim":"bool","annots":["%isRemoved"]},{"prim":"option","annots":["%entrypoint"],"args":[{"prim":"pair","args":[{"prim":"string","annots":["%method"]},{"prim":"address","annots":["%addr"]}]}]}]}]},{"prim":"option","args":[{"prim":"pair","args":[{"prim":"address","annots":["%oldAddr"]},{"prim":"address","annots":["%newAddr"]}]}]}]},{"prim":"pair","annots":["%callContract"],"args":[{"prim":"string","annots":["%entrypointName"]},{"prim":"bytes","annots":["%payload"]}]}]}]},{"prim":"storage","args":[{"prim":"pair","args":[{"prim":"address","annots":["%governance"]},{"prim":"big_map","annots":["%entrypoints"],"args":[{"prim":"string"},{"prim":"pair","args":[{"prim":"string","annots":["%method"]},{"prim":"address","annots":["%addr"]}]}]}]}]},{"prim":"code","args":[[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]],{"prim":"IF_LEFT","args":[[[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CAR"},{"prim":"SENDER"},{"prim":"COMPARE"},{"prim":"NEQ"},{"prim":"IF","args":[[{"prim":"DROP","args":[{"int":"2"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"Permission denied"}]},{"prim":"FAILWITH"}],[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]],[{"prim":"DIP","args":[{"int":"2"},[{"prim":"DUP"}]]},{"prim":"DIG","args":[{"int":"3"}]}],{"prim":"CDR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"LEFT","args":[{"prim":"big_map","args":[{"prim":"string"},{"prim":"pair","args":[{"prim":"string"},{"prim":"address"}]}]}]},{"prim":"LOOP_LEFT","args":[[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]],{"prim":"IF_CONS","args":[[{"prim":"DUP"},{"prim":"GET","args":[{"int":"4"}]},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"bool"},{"prim":"True"}]},[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"GET","args":[{"int":"3"}]},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"DIG","args":[{"int":"2"}]},{"prim":"NONE","args":[{"prim":"pair","args":[{"prim":"string"},{"prim":"address"}]}]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"CAR"},{"prim":"UPDATE"}],[{"prim":"DROP"},{"prim":"SWAP"}]]}],[{"prim":"DROP"},{"prim":"PUSH","args":[{"prim":"bool"},{"prim":"False"}]},[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"GET","args":[{"int":"3"}]},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"DUP"},{"prim":"GET","args":[{"int":"4"}]},{"prim":"IF_NONE","args":[[{"prim":"DROP"},{"prim":"SWAP"}],[{"prim":"DIG","args":[{"int":"3"}]},{"prim":"SWAP"},{"prim":"SOME"},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"CAR"},{"prim":"UPDATE"}]]}],[{"prim":"DROP"},{"prim":"SWAP"}]]}]]},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"LEFT","args":[{"prim":"big_map","args":[{"prim":"string"},{"prim":"pair","args":[{"prim":"string"},{"prim":"address"}]}]}]}],[{"prim":"RIGHT","args":[{"prim":"pair","args":[{"prim":"list","args":[{"prim":"pair","args":[{"prim":"string"},{"prim":"bool"},{"prim":"option","args":[{"prim":"pair","args":[{"prim":"string"},{"prim":"address"}]}]}]}]},{"prim":"big_map","args":[{"prim":"string"},{"prim":"pair","args":[{"prim":"string"},{"prim":"address"}]}]}]}]}]]}]]},{"prim":"SWAP"},{"prim":"IF_NONE","args":[[{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"NIL","args":[{"prim":"operation"}]}],[{"prim":"DUP"},{"prim":"CAR"},{"prim":"CONTRACT","args":[{"prim":"pair","args":[{"prim":"string","annots":["%entrypointName"]},{"prim":"bytes","annots":["%payload"]}]}]},{"prim":"IF_NONE","args":[[{"prim":"DROP"},{"prim":"PUSH","args":[{"prim":"string"},{"string":"No contract found at this address"}]},{"prim":"FAILWITH"}],[{"prim":"AMOUNT"},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"CDR"},{"prim":"PACK"},{"prim":"PUSH","args":[{"prim":"string"},{"string":"changeVersion"}]},{"prim":"PAIR"},{"prim":"TRANSFER_TOKENS"}]]},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"UPDATE","args":[{"int":"2"}]},{"prim":"NIL","args":[{"prim":"operation"}]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"CONS"}]]},{"prim":"PAIR"}]]}],[[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CDR"},[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"CAR"},{"prim":"GET"},{"prim":"IF_NONE","args":[[{"prim":"DROP","args":[{"int":"2"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"No entrypoint found"}]},{"prim":"FAILWITH"}],[{"prim":"DUP"},{"prim":"CDR"},{"prim":"CONTRACT","args":[{"prim":"pair","args":[{"prim":"string","annots":["%entrypointName"]},{"prim":"bytes","annots":["%payload"]}]}]},{"prim":"IF_NONE","args":[[{"prim":"DROP","args":[{"int":"3"}]},{"prim":"PUSH","args":[{"prim":"string"},{"string":"No contract found at this address"}]},{"prim":"FAILWITH"}],[{"prim":"DIG","args":[{"int":"3"}]},{"prim":"NIL","args":[{"prim":"operation"}]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"AMOUNT"},{"prim":"DIG","args":[{"int":"5"}]},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"5"}]},{"prim":"CAR"},{"prim":"PAIR"},{"prim":"TRANSFER_TOKENS"},{"prim":"CONS"},{"prim":"PAIR"}]]}]]}]]}]]},{"prim":"view","args":[{"string":"getView"},{"prim":"string"},{"prim":"bytes"},[[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"DIP","args":[[{"prim":"CDR"}]]}]],{"prim":"SWAP"},{"prim":"CDR"},[{"prim":"DIP","args":[[{"prim":"DUP"}]]},{"prim":"SWAP"}],{"prim":"GET"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"string"},{"string":" not declared on this proxy"}]},{"prim":"SWAP"},{"prim":"PUSH","args":[{"prim":"string"},{"string":"View "}]},{"prim":"CONCAT"},{"prim":"CONCAT"},{"prim":"FAILWITH"}],[{"prim":"CDR"},{"prim":"SWAP"},{"prim":"VIEW","args":[{"string":"getView"},{"prim":"bytes"}]},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"string"},{"string":"option is None"}]},{"prim":"FAILWITH"}],[]]}]]}]]}]`)
};