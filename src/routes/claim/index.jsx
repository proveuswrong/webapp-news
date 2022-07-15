import * as styles from "./index.module.scss";
import Tooltip from "/src/components/ui/tooltip";
import Pill from "/src/components/ui/pill";
import Tag from "/src/components/ui/tag";
import CustomButton from "/src/components/ui/button";

import { useParams, useNavigate, useLocation } from "react-router-dom";
import Interval from "react-interval-rerender";
import { EthereumContext, getClaimByID } from "../../data/ethereumProvider";
import { ipfsGateway } from "../../utils/addToIPFS";
import { useEffect, useState, useContext } from "react";

import { utils, constants, BigNumber } from "ethers";

export default function Index() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const ethereumContext = useContext(EthereumContext);
  const [claim, setClaim] = useState();
  const [claimContent, setClaimContent] = useState();
  const [fetchingClaim, setFetchingClaim] = useState(true);
  const [fetchingClaimContent, setFetchingClaimContent] = useState(true);


  useEffect(() => {
    let didCancel = false;

    if (!didCancel) {
      getClaimByID(params.chain, params.contract, params.id).then((data) => {
        setClaim(data);
        setFetchingClaim(false);
      });
    }

    return () => {
      didCancel = true;
    };
  }, [ethereumContext.blockNumber]);

  useEffect(() => {
    let didCancel = false;

    if (!didCancel && claim)
      fetch(ipfsGateway + claim.claimID)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not OK");
          }

          return response.json().then((data) =>
            setClaimContent((prevState) => ({
              ...prevState,
              title: data.title,
              description: data.description,
            }))
          );
        })
        .catch(console.error)
        .then(setFetchingClaimContent(false));

    return () => {
      didCancel = true;
    };
    console.log(claim && claim);
    console.log(claimContent && claimContent);

  }, [claim]);

  async function handleInitiateWithdrawal() {
    const unsignedTx = await ethereumContext.contractInstance.populateTransaction.initiateWithdrawal(
      claim.storageAddress
    );
    ethereumContext.ethersProvider.getSigner().sendTransaction(unsignedTx).then(console.log);
  }

  async function handleIncreaseBounty() {
    const unsignedTx = await ethereumContext.contractInstance.populateTransaction.increaseBounty(claim.storageAddress, {
      value: constants.Two.mul(claim.bounty),
    });
    ethereumContext.ethersProvider.getSigner().sendTransaction(unsignedTx).then(console.log);
  }

  async function handleChallenge() {
    const fee = await ethereumContext.contractInstance.challengeFee(claim.storageAddress);

    const unsignedTx = await ethereumContext.contractInstance.populateTransaction.challenge(claim.storageAddress, {
      value: fee,
    });
    ethereumContext.ethersProvider.getSigner().sendTransaction(unsignedTx).then(console.log);
  }

  async function handleExecuteWithdrawal() {
    const unsignedTx = await ethereumContext.contractInstance.populateTransaction.withdraw(claim.storageAddress);
    ethereumContext.ethersProvider.getSigner().sendTransaction(unsignedTx).then(console.log);
  }

  async function handleRevamp() {
    const unsignedTx = await ethereumContext.contractInstance.populateTransaction.initializeClaim(
      claim.claimID,
      claim.category,
      claim.storageAddress,
      { value: "12312312311111" }
    );
    ethereumContext.ethersProvider.getSigner().sendTransaction(unsignedTx).then(console.log);
  }

  let reRenderInMs = 1000;




  return (
    <section>
      <div className={styles.containerKeyMetrics}>
      {claim && (
        <span className={styles.trustScore}>
          {" "}
          Trust Score:{" "}


              {fetchingClaim ? (
                "Fetching claim"
              ) : (
                <Interval delay={reRenderInMs}>
                  {() =>
                    getTrustScore(claim, getTimePastSinceLastBountyUpdate(claim, ethereumContext.blockNumber))
                  }
                </Interval>
              )}



        </span>
      )}
        <Tooltip placement="topLeft" title={`Last changed ${getTimePastSinceLastBountyUpdate(claim, ethereumContext.blockNumber)} blocks ago.`}>

        <span className={styles.bountyAmount}>
          Bounty:{" "}
          {fetchingClaim
            ? "fetching"
            : `${parseFloat(utils.formatUnits(claim?.bounty)).toFixed(3)} ${constants.EtherSymbol}`}{" "}

        </span>
        </Tooltip>
      </div>
      {/*<img className={styles.image}/>*/}

      <div className={styles.containerMetadata}>
        <Tooltip placement="topLeft" title={`Pool name: ${ethereumContext?.metaEvidenceContents[claim?.category]?.category}`}>
        <span>
          <b>
          Curation Pool ID: {claim?.category}
            </b>
        </span>
        </Tooltip>

        <span>
          <Tooltip placement="bottomLeft" title={`Exact block number: ${claim?.createdAtBlock}`}>{new Date(parseInt(claim?.createdAtTimestamp)*1000).toDateString()}</Tooltip> by <Tooltip placement="bottomRight" title={claim?.owner}>{fetchingClaim ? "fetching" : claim?.owner.substring(0,6)}...{ claim?.owner.slice(-4)}</Tooltip>
        </span>


        {claim?.disputeID && (
          <span>
            Dispute ID:{" "}
            <a href={`https://resolve.kleros.io/cases/${claim.disputeID}`} target="_blank" rel="noopener noreferrer">
              <span key={claim?.disputeID} className="blink">
                {claim?.disputeID}
              </span>
            </a>
          </span>
        )}
      </div>


        <h1 className={styles.title}>
          {!fetchingClaimContent && !claimContent && "⚠️"}{" "}
          {claimContent?.title || (fetchingClaimContent ? "fetching..." : "Failed to fetch claim title.")}{" "}
          {!fetchingClaimContent && !claimContent && "⚠️"}{" "}
        </h1>
      <Pill>Live</Pill>



        {/*We need to get arbitrator address somehow. Last thing I tried is to add this field to Index Entity on Subgraph. See 0.0.19*/}
        {/*<p>Arbitrator Short Name: {claim.category.arbitrator.shortName}</p>*/}
        {/*<p>Arbitrator Long Name: {claim.category.arbitrator.fullName}</p>*/}
        {/*<p>Arbitrator Fee: {claim.category.arbitrator.shortName}</p>*/}
        {/*<p>*/}
        {/*  Arbitration Fee: {(claim.category.arbitrator.feePerVote * claim.category.jurySize).toFixed(3)}{" "}*/}
        {/*  {claim.category.arbitrator.currency}*/}
        {/*</p>*/}
        {/*<p>Jury Size: {claim.category.jurySize} votes</p>*/}
        <p>
          {" "}
          {claimContent?.description || (fetchingClaimContent ? "fetching..." : "Failed to fetch claim description.")}
        </p>
      <div className={styles.containerTag}>
        <Tag>Economy</Tag><Tag>Technology</Tag>
        </div>

        <div className={styles.containerButtons}>
          <CustomButton modifiers='secondary'
            onClick={() => {
              navigate("/browse" + location.search);
            }}
          >
            Go back
          </CustomButton>
          {ethereumContext.accounts[0] == claim?.owner && claim?.status == "Live" && (
            <CustomButton onClick={handleInitiateWithdrawal}>Initiate Withdrawal</CustomButton>
          )}
          {ethereumContext.accounts[0] == claim?.owner && claim?.status == "Live" && (
            <CustomButton onClick={handleIncreaseBounty}>Double Bounty</CustomButton>
          )}
          {ethereumContext.accounts[1] != claim?.owner && claim?.status == "Live" && (
            <CustomButton onClick={handleChallenge}>Prove it Wrong</CustomButton>
          )}
          {ethereumContext.accounts[0] == claim?.owner && claim?.status == "TimelockStarted" && (
            <CustomButton onClick={handleExecuteWithdrawal}>
              {getWithdrawalCountdown(claim) > 0 ? (
                <span>
                  You can execute withdrawal in
                  <Interval delay={reRenderInMs}>{() => getWithdrawalCountdown(claim)}</Interval> seconds
                </span>
              ) : (
                "Execute Withdrawal"
              )}
            </CustomButton>
          )}
          {claim?.status == "Withdrawn" && <button onClick={handleRevamp}>Revamp</button>}
        </div>
      <small key={ethereumContext.blockNumber} style={{ marginTop: "auto" }}>
        Last updated at block no: <span className="blink">{ethereumContext.blockNumber}</span>
      </small>
    </section>
  );
}

export const getTimePastSinceLastBountyUpdate = (claim, currentBlockNumber) =>
  parseInt(currentBlockNumber) - parseInt(claim?.lastBalanceUpdate);

export const getWithdrawalCountdown = (claim) =>
  Math.max(parseInt(claim.withdrawalPermittedAt) - parseInt(Date.now() / 1000), 0);

export const getTrustScore = (claim, timePastSinceLastBountyUpdate) => {
  const timeDelta = BigNumber.from(timePastSinceLastBountyUpdate);
  const previouslyAccumulatedScore = BigNumber.from(claim?.lastCalculatedScore);
  const bounty = BigNumber.from(claim?.bounty);
  const rawScore = previouslyAccumulatedScore.add(timeDelta.mul(bounty));
  const normalizedScore = utils.formatEther(rawScore); // Divides by 10^18 to prevent big numbers.
  return parseInt(normalizedScore).toFixed(0);
};
