
import './App.css';

import Papa from "papaparse";
import { useState } from 'react';

export default function PinPage() {
  const [cids, setCids] = useState()
  const [results, setResults] = useState([])
  console.log(cids)

  async function doPin(cid, i) {
    if (cid && cid !== "") {
      var axios = require('axios');
      var result
      var data = JSON.stringify({
        "hashToPin": cid
      });

      var config = {
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinByHash',
        headers: {
          'Authorization': 'Bearer <JWT KEY>',
          'Content-Type': 'application/json'
        },
        data: data
      };

      const res = await axios(config);
      result = "pinned: " + res.data.ipfsHash

      setResults((results) => ([...results, ...[result]]))
      //console.log(res.data);
    }
  }

  function PinCID(cids) {
    var array = cids;
    var interval = 250; // avoid 429 errors on the pinata server min 250ms
    var promise = Promise.resolve();
    if (cids) {
      array.forEach(function (cid) {
        promise = promise.then(function () {
          doPin(cid[0])
            .catch(error => {
              console.log(error)
            })
          return new Promise(function (resolve) {
            setTimeout(resolve, interval);
          });
        });

      });
    }
    promise.then(function () {
      console.log('Pinning finished successfully');
    });
  }
  console.log(results)
  function handlePin() {
    setResults([results, ...["Started to pin"]])
    PinCID(cids)
  }

  return (
    <div className="App">
      <div>Select a csv file of CID's to pin</div>
      <div style={{ paddingTop: "20px" }}>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            const files = e.target.files;
            console.log(files);
            if (files) {
              console.log(files[0]);
              Papa.parse(files[0], {
                complete: function (results) {
                  setCids(results.data.filter(result => result[0].length > 2))
                }
              }
              )
            }
          }}
        />
      </div>
      <br />
      <br />
      {cids &&
        <>{cids.length} Hashes loaded<br />
          <button onClick={() => handlePin()}>PinCIDS</button></>
      }
      <br />
      <br />
      {results.length > 0 &&
        results.map((result, i) => {
          return (<div key={i}>{result}</div>)
        })
      }
    </div>
  );
}