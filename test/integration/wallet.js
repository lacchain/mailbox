import chai from 'chai';
import { DID } from '@lacchain/did';
import chaiAsPromised from "chai-as-promised";
import { didCommService } from "../../src/services/index.js";
import config from "../../src/config.js";
import didJWT from "did-jwt";
import moment from "moment";
import { generateKeyPair } from "../../src/utils/crypt.js";
import axios from "axios";

const expect = chai.expect;
chai.use( chaiAsPromised );
chai.should();

const DID_CONFIG = {
	registry: '0xCC77A5e709cB473F49c943D9b40B989f986E5F2F',
	rpcUrl: 'https://writer.lacchain.net',
	network: 'main'
};

describe( 'Wallet', () => {
	const credentials = [
		// Health
		{
			"@context": [
				"https://www.w3.org/2018/credentials/v1",
				"https://credentials-library.lacchain.net/credentials/security/trusted/v1",
				"https://credentials-library.lacchain.net/credentials/health/vaccination/v1"
			],
			"id": "12cf1390-4bc5-4438-bf62-229d5ca493d8",
			"type": [
				"VerifiableCredential",
				"TrustedCredential",
				"VaccinationCertificate"
			],
			"issuer": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF",
			"issuanceDate": "2021-08-11T18:56:19.208Z",
			"expirationDate": "2022-08-11T18:56:19.208Z",
			"credentialSubject": {
				"id": "did:lac:main:0x4ef9E4721BBF02b84D0E73822EE4E26e95076b9D",
				"name": "Sergio Cerón Figueroa",
				"birthDate": "25-01-1989",
				"sex": "male",
				"vaccine": {
					"vaccine": "XN109",
					"brand": "BNT162b2",
					"manufacturer": "Pfizer / BioNTech",
					"authorization": "23423424",
					"batch": "1230JHLI918",
					"dose": 2,
					"vaccinationDate": "2021-02-15T16:22:00.028Z",
					"country": "367",
					"administeringCentre": "University of Cambridge",
					"worker": "did:lac:main:0xd1ed9d70a4dbbfe7378d68a987c7d909332b35c4",
					"disease": "RA01.0",
					"birthDate": "30-04-2021"
				}
			},
			"trustedList": "0x3102e6CA32B5241727d5d0099219aA3B19e65C51",
			"credentialStatus": {
				"id": "0x4185Dab0662ccDa3D3F35779578a4242bb89Db37",
				"type": "SmartContract"
			},
			"proof": [
				{
					"id": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF#vm-0",
					"domain": "0x0634E707B1bC33B29cb583524CF6EDA6211E55d3",
					"proofValue": "0xafdcbf2daa12c65ecd1796974f90cc78199d0071f831e35e685a15ec9b346d7664ceb4286b77a470e97f402eafac8ef804900f4a1a0ba72b3bfab47f28931bdc1b"
				}
			]
		}, // Regular
		{
			"@context": [
				"https://www.w3.org/2018/credentials/v1",
				"https://credentials-library.lacchain.net/credentials/security/trusted/v1",
				"https://credentials-library.lacchain.net/credentials/health/vaccination/v1"
			],
			"id": "22cf1390-4bc5-4438-bf62-229d5ca493d9",
			"type": [
				"VerifiableCredential",
				"TrustedCredential",
				"VaccinationCertificate"
			],
			"issuer": "did:lac:main:0x4ef9E4721BBF02b84D0E73822EE4E26e95076b9D",
			"issuanceDate": "2021-08-11T18:56:19.208Z",
			"expirationDate": "2022-08-11T18:56:19.208Z",
			"credentialSubject": {
				"id": "did:lac:main:0x4ef9E4721BBF02b84D0E73822EE4E26e95076b9D",
				"name": "Sergio Cerón Figueroa",
				"birthDate": "25-01-1989",
				"sex": "male",
				"vaccine": {
					"vaccine": "XN109",
					"brand": "BNT162b2",
					"manufacturer": "Pfizer / BioNTech",
					"authorization": "23423424",
					"batch": "1230JHLI918",
					"dose": 2,
					"vaccinationDate": "2021-02-15T16:22:00.028Z",
					"country": "367",
					"administeringCentre": "University of Cambridge",
					"worker": "did:lac:main:0xd1ed9d70a4dbbfe7378d68a987c7d909332b35c4",
					"disease": "RA01.0",
					"birthDate": "30-04-2021"
				}
			},
			"trustedList": "0x3102e6CA32B5241727d5d0099219aA3B19e65C51",
			"credentialStatus": {
				"id": "0x4185Dab0662ccDa3D3F35779578a4242bb89Db37",
				"type": "SmartContract"
			},
			"proof": [
				{
					"id": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF#vm-0",
					"domain": "0x0634E707B1bC33B29cb583524CF6EDA6211E55d3",
					"proofValue": "0xafdcbf2daa12c65ecd1796974f90cc78199d0071f831e35e685a15ec9b346d7664ceb4286b77a470e97f402eafac8ef804900f4a1a0ba72b3bfab47f28931bdc1b"
				}
			]
		}, // Not exists
		{
			"@context": [
				"https://www.w3.org/2018/credentials/v1",
				"https://credentials-library.lacchain.net/credentials/security/trusted/v1",
				"https://credentials-library.lacchain.net/credentials/health/vaccination/v1"
			],
			"id": "72cf1390-4bc5-4438-bf62-229d5ca493d0",
			"type": [
				"VerifiableCredential",
				"TrustedCredential",
				"VaccinationCertificate"
			],
			"issuer": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF",
			"issuanceDate": "2021-08-11T18:56:19.208Z",
			"expirationDate": "2022-08-11T18:56:19.208Z",
			"credentialSubject": {
				"id": "did:lac:main:0x4ef9E4721BBF02b84D0E73822EE4E26e95076b9D",
				"name": "Sergio Cerón Figueroa",
				"birthDate": "25-01-1989",
				"sex": "male",
				"vaccine": {
					"vaccine": "XN109",
					"brand": "BNT162b2",
					"manufacturer": "Pfizer / BioNTech",
					"authorization": "23423424",
					"batch": "1230JHLI918",
					"dose": 2,
					"vaccinationDate": "2021-02-15T16:22:00.028Z",
					"country": "367",
					"administeringCentre": "University of Cambridge",
					"worker": "did:lac:main:0xd1ed9d70a4dbbfe7378d68a987c7d909332b35c4",
					"disease": "RA01.0",
					"birthDate": "30-04-2021"
				}
			},
			"trustedList": "0x3102e6CA32B5241727d5d0099219aA3B19e65C51",
			"credentialStatus": {
				"id": "0x4185Dab0662ccDa3D3F35779578a4242bb89Db37",
				"type": "SmartContract"
			},
			"proof": [
				{
					"id": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF#vm-0",
					"domain": "0x0634E707B1bC33B29cb583524CF6EDA6211E55d3",
					"proofValue": "0x1fdcbf2daa12c65ecd1796974f90cc78199d0071f831e35e685a15ec9b346d7664ceb4286b77a470e97f402eafac8ef804900f4a1a0ba72b3bfab47f28931bdc1b"
				}
			]
		}, // Invalid issuer signature
		{
			"@context": [
				"https://www.w3.org/2018/credentials/v1",
				"https://credentials-library.lacchain.net/credentials/security/trusted/v1",
				"https://credentials-library.lacchain.net/credentials/health/vaccination/v1"
			],
			"id": "2819bdbf-631b-488e-81e6-a01212b5c48e",
			"type": [
				"VerifiableCredential",
				"TrustedCredential",
				"VaccinationCertificate"
			],
			"issuer": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF",
			"issuanceDate": "2021-08-11T18:56:25.560Z",
			"expirationDate": "2021-08-11T18:56:25.560Z",
			"credentialSubject": {
				"id": "did:lac:main:0x4ef9E4721BBF02b84D0E73822EE4E26e95076b9D",
				"name": "Sergio Cerón Figueroa",
				"birthDate": "25-01-1989",
				"sex": "male",
				"vaccine": {
					"vaccine": "XN109",
					"brand": "BNT162b2",
					"manufacturer": "Pfizer / BioNTech",
					"authorization": "23423424",
					"batch": "1230JHLI918",
					"dose": 2,
					"vaccinationDate": "2021-02-15T16:22:00.028Z",
					"country": "367",
					"administeringCentre": "University of Cambridge",
					"worker": "did:lac:main:0xd1ed9d70a4dbbfe7378d68a987c7d909332b35c4",
					"disease": "RA01.0",
					"birthDate": "30-04-2021"
				}
			},
			"trustedList": "0x3102e6CA32B5241727d5d0099219aA3B19e65C51",
			"credentialStatus": {
				"id": "0x4185Dab0662ccDa3D3F35779578a4242bb89Db37",
				"type": "SmartContract"
			},
			"proof": [
				{
					"id": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF#vm-0",
					"domain": "0x0634E707B1bC33B29cb583524CF6EDA6211E55d3",
					"proofValue": "0xe74b93cc66ccc6112c75de901db2cbdb0597c85362118dd7294869471652531a6d2606015027196479fdff57efa996b4fbac2fe947111a5f0a4eb59235fb87b61b"
				}
			]
		}, // Expired
		{
			"@context": [
				"https://www.w3.org/2018/credentials/v1",
				"https://credentials-library.lacchain.net/credentials/security/trusted/v1",
				"https://credentials-library.lacchain.net/credentials/health/vaccination/v1"
			],
			"id": "4fd046a6-8102-42f7-aa57-54dd78cbfe0e",
			"type": [
				"VerifiableCredential",
				"TrustedCredential",
				"VaccinationCertificate"
			],
			"issuer": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF",
			"issuanceDate": "2021-08-11T18:56:29.719Z",
			"expirationDate": "2022-08-11T18:56:29.719Z",
			"credentialSubject": {
				"id": "did:lac:main:0x4ef9E4721BBF02b84D0E73822EE4E26e95076b9D",
				"name": "Sergio Cerón Figueroa",
				"birthDate": "25-01-1989",
				"sex": "male",
				"vaccine": {
					"vaccine": "XN109",
					"brand": "BNT162b2",
					"manufacturer": "Pfizer / BioNTech",
					"authorization": "23423424",
					"batch": "1230JHLI918",
					"dose": 2,
					"vaccinationDate": "2021-02-15T16:22:00.028Z",
					"country": "367",
					"administeringCentre": "University of Cambridge",
					"worker": "did:lac:main:0xd1ed9d70a4dbbfe7378d68a987c7d909332b35c4",
					"disease": "RA01.0",
					"birthDate": "30-04-2021"
				}
			},
			"trustedList": "0x3102e6CA32B5241727d5d0099219aA3B19e65C51",
			"credentialStatus": {
				"id": "0x4185Dab0662ccDa3D3F35779578a4242bb89Db37",
				"type": "SmartContract"
			},
			"proof": [
				{
					"id": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0xF8e160be646D2429C64D46Fba8e8588b8483DBaF#vm-0",
					"domain": "0x0634E707B1bC33B29cb583524CF6EDA6211E55d3",
					"proofValue": "0x1291259fd5b6f6ea78b994fd00bae8eed92c11b87676e9bcfc99b5f53cd44f2143b6a794324eab3fd8160f57a1b76e6ebc82cfb4c83be62cdf2bbac3e9b74fbc1c"
				}
			]
		},  // Revoked
		// Education
		{
			"@context": [
				"https://www.w3.org/2018/credentials/v1",
				"https://credentials-library.lacchain.net/credentials/security/trusted/v1",
				"https://credentials-library.lacchain.net/credentials/education/lacchain-academy/v1"
			],
			"id": "92dd20e5-3199-45b4-af2e-c45fb7fc990a",
			"type": [
				"VerifiableCredential",
				"TrustedCredential",
				"AcademyCertificate"
			],
			"issuer": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7",
			"issuanceDate": "2021-08-11T18:54:20.206Z",
			"expirationDate": "2022-08-11T18:54:20.207Z",
			"credentialSubject": {
				"id": "did:lac:main:0x4ef9E4721BBF02b84D0E73822EE4E26e95076b9D",
				"givenName": "Sergio",
				"familyName": "Cerón",
				"email": "sergioce@iadb.org",
				"holds": {
					"category": "Diploma",
					"industry": "Computer Science",
					"skillset": "Blockchain",
					"course": "Introducción a LACChain Besu",
					"description": "Curso introductorio de despliegue de nodos en LACChain Besu para desarrolladores",
					"url": "https://aula.blockchainacademy.cl/p/introduccion-a-lacchain",
					"duration": 40,
					"modality": "virtual",
					"location": null
				}
			},
			"trustedList": "0xCD1427a4bb4A451335B2d9ADd5F5518440737701",
			"credentialStatus": {
				"id": "0x4185Dab0662ccDa3D3F35779578a4242bb89Db37",
				"type": "SmartContract"
			},
			"proof": [
				{
					"id": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0x4982b9b8776c42c647c5fecfdfaba141c4716b2ff67fbe03688623ec99fdab0539ed60b3098feb966487cb9982229fa9f9f874ba17d84c2c89f9b6a46da2b6821b"
				},
				{
					"id": "did:lac:main:0x4a5A6460D00c4D8C2835A3067f53Fb42021D5bB9",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0x4a5A6460D00c4D8C2835A3067f53Fb42021D5bB9#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0xf3f509f982cedc3bd370e20d949317a898eef8dbe90b376f651b1897530ec24854171b992694b9f9de8e481eaeaad0d9a396a3e9afff8b4a4dbb84039e49e6491b"
				},
				{
					"id": "did:lac:main:0x4222EC932c5a68b80e71F4dDebb069fa02518b8A",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0x4222EC932c5a68b80e71F4dDebb069fa02518b8A#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0x5529abecf8c7429baa54ba78cae621ca301d5ae82998772c818c5afb3c4b152e19be44cfee4113379bf2b811aa53de5745e0825399b9ce56a09ad091ce460dd71c"
				}
			]
		}, // Regular
		{
			"@context": [
				"https://www.w3.org/2018/credentials/v1",
				"https://credentials-library.lacchain.net/credentials/security/trusted/v1",
				"https://credentials-library.lacchain.net/credentials/education/lacchain-academy/v1"
			],
			"id": "12dd20e5-3199-45b4-af2e-c45fb7fc990b",
			"type": [
				"VerifiableCredential",
				"TrustedCredential",
				"AcademyCertificate"
			],
			"issuer": "did:lac:main:0x4222EC932c5a68b80e71F4dDebb069fa02518b8A",
			"issuanceDate": "2021-08-11T18:54:20.206Z",
			"expirationDate": "2022-08-11T18:54:20.207Z",
			"credentialSubject": {
				"id": "did:lac:main:0x4ef9E4721BBF02b84D0E73822EE4E26e95076b9D",
				"givenName": "Sergio",
				"familyName": "Cerón",
				"email": "sergioce@iadb.org",
				"holds": {
					"category": "Diploma",
					"industry": "Computer Science",
					"skillset": "Blockchain",
					"course": "Introducción a LACChain Besu",
					"description": "Curso introductorio de despliegue de nodos en LACChain Besu para desarrolladores",
					"url": "https://aula.blockchainacademy.cl/p/introduccion-a-lacchain",
					"duration": 40,
					"modality": "virtual",
					"location": null
				}
			},
			"trustedList": "0xCD1427a4bb4A451335B2d9ADd5F5518440737701",
			"credentialStatus": {
				"id": "0x4185Dab0662ccDa3D3F35779578a4242bb89Db37",
				"type": "SmartContract"
			},
			"proof": [
				{
					"id": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0x4982b9b8776c42c647c5fecfdfaba141c4716b2ff67fbe03688623ec99fdab0539ed60b3098feb966487cb9982229fa9f9f874ba17d84c2c89f9b6a46da2b6821b"
				},
				{
					"id": "did:lac:main:0x4a5A6460D00c4D8C2835A3067f53Fb42021D5bB9",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0x4a5A6460D00c4D8C2835A3067f53Fb42021D5bB9#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0xf3f509f982cedc3bd370e20d949317a898eef8dbe90b376f651b1897530ec24854171b992694b9f9de8e481eaeaad0d9a396a3e9afff8b4a4dbb84039e49e6491b"
				},
				{
					"id": "did:lac:main:0x4222EC932c5a68b80e71F4dDebb069fa02518b8A",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0x4222EC932c5a68b80e71F4dDebb069fa02518b8A#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0x5529abecf8c7429baa54ba78cae621ca301d5ae82998772c818c5afb3c4b152e19be44cfee4113379bf2b811aa53de5745e0825399b9ce56a09ad091ce460dd71c"
				}
			]
		}, // Invalid Issuer
		{
			"@context": [
				"https://www.w3.org/2018/credentials/v1",
				"https://credentials-library.lacchain.net/credentials/security/trusted/v1",
				"https://credentials-library.lacchain.net/credentials/education/lacchain-academy/v1"
			],
			"id": "22dd20e5-3199-45b4-af2e-c45fb7fc990c",
			"type": [
				"VerifiableCredential",
				"TrustedCredential",
				"AcademyCertificate"
			],
			"issuer": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7",
			"issuanceDate": "2021-08-11T18:54:20.206Z",
			"expirationDate": "2022-08-11T18:54:20.207Z",
			"credentialSubject": {
				"id": "did:lac:main:0x4ef9E4721BBF02b84D0E73822EE4E26e95076b9D",
				"givenName": "Sergio",
				"familyName": "Cerón",
				"email": "sergioce@iadb.org",
				"holds": {
					"category": "Diploma",
					"industry": "Computer Science",
					"skillset": "Blockchain",
					"course": "Introducción a LACChain Besu",
					"description": "Curso introductorio de despliegue de nodos en LACChain Besu para desarrolladores",
					"url": "https://aula.blockchainacademy.cl/p/introduccion-a-lacchain",
					"duration": 40,
					"modality": "virtual",
					"location": null
				}
			},
			"trustedList": "0xCD1427a4bb4A451335B2d9ADd5F5518440737701",
			"credentialStatus": {
				"id": "0x4185Dab0662ccDa3D3F35779578a4242bb89Db37",
				"type": "SmartContract"
			},
			"proof": [
				{
					"id": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0x3982b9b8776c42c647c5fecfdfaba141c4716b2ff67fbe03688623ec99fdab0539ed60b3098feb966487cb9982229fa9f9f874ba17d84c2c89f9b6a46da2b6821b"
				},
				{
					"id": "did:lac:main:0x4a5A6460D00c4D8C2835A3067f53Fb42021D5bB9",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0x4a5A6460D00c4D8C2835A3067f53Fb42021D5bB9#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0xf3f509f982cedc3bd370e20d949317a898eef8dbe90b376f651b1897530ec24854171b992694b9f9de8e481eaeaad0d9a396a3e9afff8b4a4dbb84039e49e6491b"
				},
				{
					"id": "did:lac:main:0x4222EC932c5a68b80e71F4dDebb069fa02518b8A",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0x4222EC932c5a68b80e71F4dDebb069fa02518b8A#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0x7529abecf8c7429baa54ba78cae621ca301d5ae82998772c818c5afb3c4b152e19be44cfee4113379bf2b811aa53de5745e0825399b9ce56a09ad091ce460dd71c"
				}
			]
		}, // Invalid Signature
		{
			"@context": [
				"https://www.w3.org/2018/credentials/v1",
				"https://credentials-library.lacchain.net/credentials/security/trusted/v1",
				"https://credentials-library.lacchain.net/credentials/education/lacchain-academy/v1"
			],
			"id": "b88cdccc-dc44-4a37-8566-1de07b7971f9",
			"type": [
				"VerifiableCredential",
				"TrustedCredential",
				"AcademyCertificate"
			],
			"issuer": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7",
			"issuanceDate": "2021-08-11T18:54:37.531Z",
			"expirationDate": "2021-08-11T18:54:37.531Z",
			"credentialSubject": {
				"id": "did:lac:main:0x4ef9E4721BBF02b84D0E73822EE4E26e95076b9D",
				"givenName": "Sergio",
				"familyName": "Cerón",
				"email": "sergioce@iadb.org",
				"holds": {
					"category": "Diploma",
					"industry": "Computer Science",
					"skillset": "Blockchain",
					"course": "Introducción a LACChain Besu",
					"description": "Curso introductorio de despliegue de nodos en LACChain Besu para desarrolladores",
					"url": "https://aula.blockchainacademy.cl/p/introduccion-a-lacchain",
					"duration": 40,
					"modality": "virtual",
					"location": null
				}
			},
			"trustedList": "0xCD1427a4bb4A451335B2d9ADd5F5518440737701",
			"credentialStatus": {
				"id": "0x4185Dab0662ccDa3D3F35779578a4242bb89Db37",
				"type": "SmartContract"
			},
			"proof": [
				{
					"id": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0xe0b61cb98f79a852da676a1800755344b0d003624210d8275c0e47fb88e8d8650641fb556d774b502547e237956f25045ade3d78d71ed1be8f0ff6be45b000891b"
				},
				{
					"id": "did:lac:main:0x4a5A6460D00c4D8C2835A3067f53Fb42021D5bB9",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0x4a5A6460D00c4D8C2835A3067f53Fb42021D5bB9#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0xf88cb09fe51b32bbdc81de04b8240ff58ea717c3a51d209d086c8ec361f723e125e635147e6dea70366fd1da7cf60447b58a26c5f952cc5b652e9dfac5e11c0a1c"
				},
				{
					"id": "did:lac:main:0x4222EC932c5a68b80e71F4dDebb069fa02518b8A",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0x4222EC932c5a68b80e71F4dDebb069fa02518b8A#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0x4c35d65ba10d4f4b01d6ebaf5ce9cbe87f1039579f56049f147c319998e5fa5b156eed4c93b5a44851901b5aad969df8d8e3abf3fce76ff360857c51f2fcaf5c1b"
				}
			]
		}, // Expired
		{
			"@context": [
				"https://www.w3.org/2018/credentials/v1",
				"https://credentials-library.lacchain.net/credentials/security/trusted/v1",
				"https://credentials-library.lacchain.net/credentials/education/lacchain-academy/v1"
			],
			"id": "87fde2e8-daf8-4ac6-8a12-b2fb52fd0ddc",
			"type": [
				"VerifiableCredential",
				"TrustedCredential",
				"AcademyCertificate"
			],
			"issuer": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7",
			"issuanceDate": "2021-08-11T18:54:57.480Z",
			"expirationDate": "2022-08-11T18:54:57.480Z",
			"credentialSubject": {
				"id": "did:lac:main:0x4ef9E4721BBF02b84D0E73822EE4E26e95076b9D",
				"givenName": "Sergio",
				"familyName": "Cerón",
				"email": "sergioce@iadb.org",
				"holds": {
					"category": "Diploma",
					"industry": "Computer Science",
					"skillset": "Blockchain",
					"course": "Introducción a LACChain Besu",
					"description": "Curso introductorio de despliegue de nodos en LACChain Besu para desarrolladores",
					"url": "https://aula.blockchainacademy.cl/p/introduccion-a-lacchain",
					"duration": 40,
					"modality": "virtual",
					"location": null
				}
			},
			"trustedList": "0xCD1427a4bb4A451335B2d9ADd5F5518440737701",
			"credentialStatus": {
				"id": "0x4185Dab0662ccDa3D3F35779578a4242bb89Db37",
				"type": "SmartContract"
			},
			"proof": [
				{
					"id": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0xdb71c1f42beff649372a71b14d48c54bced383d79cc9dec0bf9756d61c403498434127799de2a84ebc585bfce83d2574501079191a2a2bb127c4ac636dd53e261c"
				},
				{
					"id": "did:lac:main:0x4a5A6460D00c4D8C2835A3067f53Fb42021D5bB9",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0x4a5A6460D00c4D8C2835A3067f53Fb42021D5bB9#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0x353f50babbbd8c89671fe7c33bf67ce2b601832f38c9998b731b2d06483d39164afb5fe835f3e032018a3ccb022a8d3a2a837b6a942955f4b4b7e16009cd817d1c"
				}
			]
		}, // Incomplete Signers
		{
			"@context": [
				"https://www.w3.org/2018/credentials/v1",
				"https://credentials-library.lacchain.net/credentials/security/trusted/v1",
				"https://credentials-library.lacchain.net/credentials/education/lacchain-academy/v1"
			],
			"id": "25cf82f6-c0eb-431b-8ed8-4224e35b42e1",
			"type": [
				"VerifiableCredential",
				"TrustedCredential",
				"AcademyCertificate"
			],
			"issuer": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7",
			"issuanceDate": "2021-08-11T18:55:15.820Z",
			"expirationDate": "2022-08-11T18:55:15.821Z",
			"credentialSubject": {
				"id": "did:lac:main:0x4ef9E4721BBF02b84D0E73822EE4E26e95076b9D",
				"givenName": "Sergio",
				"familyName": "Cerón",
				"email": "sergioce@iadb.org",
				"holds": {
					"category": "Diploma",
					"industry": "Computer Science",
					"skillset": "Blockchain",
					"course": "Introducción a LACChain Besu",
					"description": "Curso introductorio de despliegue de nodos en LACChain Besu para desarrolladores",
					"url": "https://aula.blockchainacademy.cl/p/introduccion-a-lacchain",
					"duration": 40,
					"modality": "virtual",
					"location": null
				}
			},
			"trustedList": "0xCD1427a4bb4A451335B2d9ADd5F5518440737701",
			"credentialStatus": {
				"id": "0x4185Dab0662ccDa3D3F35779578a4242bb89Db37",
				"type": "SmartContract"
			},
			"proof": [
				{
					"id": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0xc1f061d629bBbA139DbD07F2eb6A9252a45514C7#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0x3956c9580be1fb9cb33dfbd207e849facfcb4a3fcef2104a418f783db7a0a5165f4c44d2afb598112db7050fcbdf892144456979315b7e70d0314ae408cb84b71c"
				},
				{
					"id": "did:lac:main:0x4a5A6460D00c4D8C2835A3067f53Fb42021D5bB9",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0x4a5A6460D00c4D8C2835A3067f53Fb42021D5bB9#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0xb1f5aa9357228a2ae25287da998f5e2eae8d41e894da0132bdc99f077f2dd199065dbab002e96247b64bc3891574b160100c3d1c8bfc799dbe4ed1e5b23a53b51c"
				},
				{
					"id": "did:lac:main:0x4222EC932c5a68b80e71F4dDebb069fa02518b8A",
					"type": "EcdsaSecp256k1Signature2019",
					"proofPurpose": "assertionMethod",
					"verificationMethod": "did:lac:main:0x4222EC932c5a68b80e71F4dDebb069fa02518b8A#vm-0",
					"domain": "0x925c3D3EBCa51a6a51B13BfC2CA902757BeeA0d3",
					"proofValue": "0xbc3cb6a6e5684e9b90f2d315245aa734870c43d4a8876ab953811793024f1925417657206f3bbed0d963a66538362cbf84a0f3a97ebcaa060a4eddd55603580c1b"
				}
			]
		}, // Revoked
	];

	const sender = {};
	const receiver = {
		did: 'did:lac:main:0xfe979fb3f81f28bc81ae8374469b6523ed9e3699'
	}

	before( async() => {
		const senderKeyPair = await generateKeyPair();
		const senderDID = new DID( { ...DID_CONFIG } );
		await senderDID.addKeyAgreement( {
			algorithm: 'x25519ka',
			encoding: 'hex',
			publicKey: `0x${senderKeyPair.publicKey}`,
			controller: senderDID.id,
		} )

		sender.did = senderDID.id;
		sender.privateKey = senderDID.config.controllerPrivateKey;
		sender.keyPair = senderKeyPair;

	} );

	it( 'alice should send a all credentials to user wallet', async() => {
		const token = await didJWT.createJWT(
			{ sub: sender.did, aud: config.did.id, exp: moment().add( 1, 'days' ).valueOf() },
			{ issuer: sender.did, signer: didJWT.ES256KSigner( sender.privateKey ) },
			{ alg: 'ES256K' }
		);

		for( const credential of credentials ) {
			const encryptedToUser = await didCommService.encrypt( credential, sender.keyPair, receiver.did, true );
			const envelope = {
				"type": "https://didcomm.org/routing/2.0/forward",
				"to": [config.did.id],
				"expires_time": 1516385931,
				"body": {
					"next": receiver.did,
					"payloads~attach": [
						encryptedToUser
					]
				}
			}
			const encryptedToMailbox = await didCommService.encrypt( envelope, sender.keyPair, config.did.id, true );
			await axios.post( 'https://mailbox.lacchain.net/vc', encryptedToMailbox, { headers: { token } } );
		}
		expect( true ).to.not.be.null;
	} );

} );