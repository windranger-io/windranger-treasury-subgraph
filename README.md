# @windranger-io/windranger-treasury-subgraph

Subgraphs for: [@windranger-io/windranger-treasury](https://github.com/windranger-io/windranger-treasury)

### Install Dependencies

```
$ yarn install
```

### Run Test Environment

```
$ yarn prepare:local && yarn codegen && yarn build
$ yarn test
```

### Update Artifacts

- Install jq 

```
$ brew install jq
```

- Ensure details are correct in `contracts.cfg` and pull abis from the configured repo & contracts

```
$ yarn run update-abis
```

### Build and deploy (to `thegraphs` hosted-service)

- Deploy the contracts and set the details in `config/*` before preparing the `subgraph.yaml`

```
$ yarn prepare:[mainnet|polygon|rinkeby|goerli]
```

- Generate the types and build

```
$ yarn codegen && yarn build
```

- Authenticate with the `graph` if you have not already done so

```
$ yarn graph auth --product hosted-service [access token]
```

- Deploy the subgraph to the graphs hosted service

    If this is the first time that this subgraph has been deployed, you must first create it on [thegraph.com](https://thegraph.com/) under the hosted service ensuring that it is within the `windranger-io` account

```
$ yarn deploy:[mainnet|polygon|rinkeby|goerli]
```

### Run Local Graph Node

- Clone @graphprotocol/graph-node

```
$ git clone https://github.com/graphprotocol/graph-node/
```

- Set the correct `network` and `rpc` endpoint in the `evironment` section of `./docker-compose.yml`, this should match the prepared network (eg: `ethereum: 'local:http://docker.for.mac.host.internal:8545'`)

```
$ vi graph-node/docker/docker-compose.yml
```

- Apply changes and start the graph-node

```
$ cd ./graph-node/docker
$ ./setup.sh
$ docker-compose up
```

### Build and Deploy Locally (to your local `graph-node` instance)

- Deploy the contracts and set the details in `config/*` before preparing the `subgraph.yaml`

```
$ yarn prepare:[local|mainnet|polygon|rinkeby|goerli]
```

- Generate the types

```
$ yarn codegen && yarn build
```

- Allocate the subgraph name in the Graph Node

```
$ yarn create-local
```

- Deploy the subgraph to local graph node

```
$ yarn deploy-local
```
