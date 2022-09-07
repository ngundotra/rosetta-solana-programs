# Rosetta Solana Programs

Repo of some example programs written using different Solana frameworks.

Ideally this will be used to compare different tooling frameworks.

Frameworks supported:
- Solana native
- Anchor
- Seahorse
- Solana native + MPL stack

## Prerequisites

Make sure you have the latest Solana tools installed - [link](https://docs.solana.com/cli/install-solana-cli-tools).

## Notable Differences

Each Anchor instruction differs from its Solana native instruction. Anchor instructions are prefixed with an 8-byte anchor discriminant that is calculated as shown below. 

```js
/* Instruction discriminator */
function sighash(nameSpace: string, ixName: string): Buffer {
  let name = snakeCase(ixName);
  let preimage = `${nameSpace}:${name}`;
  return Buffer.from(sha256.digest(preimage)).slice(0, 8);
}
const instructionDiscriminator = sighash("global", ix.name);


/* Account discriminator */
sha256.digest(`account:${camelcase(name, { pascalCase: true })}`).slice(0, 8)
```

In contrast, the native Solana examples use 1-byte prefixes.
