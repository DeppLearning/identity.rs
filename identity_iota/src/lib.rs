// Copyright 2020-2022 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

#![cfg_attr(docsrs, feature(doc_cfg))]
#![forbid(unsafe_code)]
#![allow(deprecated)]
#![doc = include_str!("./../README.md")]
#![allow(clippy::upper_case_acronyms)]
#![warn(
  rust_2018_idioms,
  unreachable_pub,
  missing_docs,
  rustdoc::missing_crate_level_docs,
  rustdoc::broken_intra_doc_links,
  rustdoc::private_intra_doc_links,
  rustdoc::private_doc_tests,
  clippy::missing_safety_doc,
  clippy::missing_errors_doc
)]

pub mod core {
  //! Core Traits and Types

  pub use identity_core::common::*;
  pub use identity_core::convert::*;
  pub use identity_core::error::*;
  pub use identity_core::utils::*;

  #[deprecated(since = "0.5.0", note = "diff chain features are slated for removal")]
  #[doc(inline)]
  pub use identity_core::diff;

  #[doc(inline)]
  pub use identity_core::json;
}

pub mod crypto {
  //! Cryptographic Utilities

  pub use identity_core::crypto::*;
}

pub mod credential {
  //! Verifiable Credentials
  //!
  //! [Specification](https://www.w3.org/TR/vc-data-model/)

  pub use identity_credential::credential::*;
  pub use identity_credential::error::*;
  pub use identity_credential::presentation::*;
  pub use identity_credential::validator::*;
}

pub mod did {
  //! Decentralized Identifiers
  //!
  //! [Specification](https://www.w3.org/TR/did-core/)

  pub use identity_did::document::*;
  pub use identity_did::error::*;
  #[cfg(feature = "revocation-bitmap")]
  pub use identity_did::revocation::*;
  pub use identity_did::service::*;
  pub use identity_did::utils::*;
  pub use identity_did::verification::*;

  pub use identity_did::did::*;

  pub use identity_did::verifiable;
}

pub mod client {
  //! IOTA DID Tangle client and validators.

  pub use identity_iota_client::chain::*;
  pub use identity_iota_client::document::*;
  pub use identity_iota_client::tangle::*;

  pub use identity_iota_client::Error;
  pub use identity_iota_client::Result;
}

pub mod iota_core {
  //! IOTA Core Traits and Types definitions

  pub use identity_iota_core::did::*;
  pub use identity_iota_core::diff::*;
  pub use identity_iota_core::document::*;
  pub use identity_iota_core::tangle::*;

  pub use identity_iota_core::Error;
  pub use identity_iota_core::Result;

  #[doc(inline)]
  pub use identity_iota_core::try_construct_did;
}

#[cfg(feature = "account")]
#[cfg_attr(docsrs, doc(cfg(feature = "account")))]
pub mod account {
  //! Secure storage for Decentralized Identifiers

  pub use identity_account::account::*;
  pub use identity_account::error::*;
  pub use identity_account::types::*;
  pub use identity_account::updates::*;
}

#[cfg(feature = "account")]
#[cfg_attr(docsrs, doc(cfg(feature = "account")))]
pub mod account_storage {
  //! Storage Trait and Types definitions

  pub use identity_account_storage::crypto::*;
  pub use identity_account_storage::error::*;
  pub use identity_account_storage::identity::*;
  pub use identity_account_storage::storage::*;
  pub use identity_account_storage::types::*;
  pub use identity_account_storage::utils::*;
}

// #[cfg(feature = "comm")]
// #[cfg_attr(docsrs, doc(cfg(feature = "comm")))]
// pub mod comm {
//   //! DID Communications Message Specification
//   //!
//   //! [Specification](https://github.com/iotaledger/identity.rs/tree/dev/docs/DID%20Communications%20Research%20and%20Specification)

//   pub use identity_comm::envelope::*;
//   pub use identity_comm::error::*;
//   pub use identity_comm::message::*;
// }

pub mod prelude {
  //! Prelude of commonly used types

  pub use identity_core::crypto::KeyPair;
  pub use identity_core::crypto::KeyType;
  pub use identity_iota_client::tangle::Client;
  pub use identity_iota_client::Result;
  pub use identity_iota_core::document::IotaDocument;
}

#[cfg(feature = "unstable-agent")]
#[cfg_attr(docsrs, doc(cfg(feature = "unstable-agent")))]
pub mod agent {
  //! Identity agent types

  pub use identity_agent::agent::*;
  pub use identity_agent::didcomm::*;
  pub use identity_agent::IdentityKeypair;
  pub use identity_agent::Multiaddr;
}
