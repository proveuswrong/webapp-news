import ReactDOM from "react-dom";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import App from "./App";
import Home from "./routes/home";
import FAQ from "./routes/faq";
import Create from "./routes/create";
import Browse from "./routes/browse";
import Claim from "./routes/claim";
import EthereumProviderErrors from "./components/ethereumProviderErrors";

import EthereumProvider, {EthereumContext, chains, contractInstances} from "./data/ethereumProvider.jsx";

const app = document.getElementById("app");

ReactDOM.render(
  <BrowserRouter>
    <EthereumProvider>
      <EthereumContext.Consumer>
        {(value) => (
          <Routes>
            <Route path="/" element={<App/>}>
              <Route index
                     element={<Browse/>}/>
              <Route path="about/" element={<Home/>}/>
              <Route path="faq/" element={<FAQ/>}/>

              <Route path=":chain/"
                     element={<Browse/>}/>
              <Route path=":chain/report/"
                     element={chains[value.chainId] && contractInstances[value.chainId] ? <Create/> : <EthereumProviderErrors/>}/>
              <Route path=":chain/:contract/:id/"
                     element={<Claim/>}/>
              <Route path="*" element={<section><h1>There's nothing here!</h1></section>}/>
            </Route>
          </Routes>
        )}
      </EthereumContext.Consumer>
    </EthereumProvider>
  </BrowserRouter>,
  app
);
