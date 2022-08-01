import {useSearchParams, Link, useParams, useNavigate, useLocation} from "react-router-dom";
import ListClaims from "../../components/listClaims";
import EthereumProviderErrors from "../../components/ethereumProviderErrors";
import {useContext, useEffect} from "react";
import {EthereumContext, contractInstances, getClaimByID} from "../../data/ethereumProvider";


import * as styles from "./index.module.scss";

export default function Browse() {

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const ethereumContext = useContext(EthereumContext);

  useEffect(() => {
    if (!params.chain) navigate(Object.keys(contractInstances)[0] + '/')
  }, [ethereumContext.blockNumber]);

  if (contractInstances[params.chain] || ethereumContext.isDeployedOnThisChain) {
    if (contractInstances[params.chain] && ethereumContext.chainId != params.chain)
      ethereumContext.changeChain(params.chain);
    return (
      <section className={styles.browse}>
        <ListClaims/>
        <small style={{marginTop: '32px', display: 'block'}}>Last updated at block no: <span
          key={ethereumContext.blockNumber} className="blink">{ethereumContext.blockNumber}</span></small>
      </section>
    )
  } else {
    return <EthereumProviderErrors providedChainId={params.chain}/>
  }


}


