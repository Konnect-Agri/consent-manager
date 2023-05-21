# Consent Manager 📝
Consent Manager is a part of [Konnet Stack](https://konnect-docs-six.vercel.app/docs/Tech_Stack/konnect_stack) which handles the entire consent lifecycle. It is responsible for blocking data request transactions and provides authorization based on data owner's consent. 

# Architecture Flow
![ade2-1c9a8e5fe5d3739341a810669fd8330f](https://github.com/Konnect-Agri/consent-manager/assets/46066481/947bf4eb-3316-4654-a544-f7cb55d84fbc)

# Block Functions
- Authentication - Verifies the authenticity of a data consumer
- Consent artifact - A consent artifact is a machine-readable electronic document that specifies the parameters and scope of data that a user consents to in any data-sharing transaction. In this framework, consent must be digitally signed, either by the user or by the consent collector or both
- Authorization (GateKeeper) - Verifies if the Query requested has the required permisions from the data owner (farmer) (checks if query is a subset of Consent Artifact)
- Query Resolver - Verifies Queries and gets data from external sources/ or state databases
- Consent Manager - Creates and Manages the lifecycle of a Consent Artifact. From request, ,generation, and revoke/expiry
- UI for Consent Manager
- UI for User

# How to get started?
This repo follows Nest.js [Mono-Repo](https://docs.nestjs.com/cli/monorepo) architecture. To get the application up and running just run `docker-compose up -d --build` at the root directory. This would create all the required containers.

![Docker Images](https://github.com/Samarth-HP/admin-ts/assets/46066481/68e8b257-c2c6-482c-b0ae-d95127985063)

## Or 

You can start each of the applications individually by running the command `yarn` followed by `yarn start <app-name>`. 

For example to start authentication service you'd need to execute `yarn start authentication` at the root directory.