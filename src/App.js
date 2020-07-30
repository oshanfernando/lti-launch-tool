import React, { useState, useRef } from 'react';
import './App.css';
import readXlsxFile from 'read-excel-file'

function App() {

  const [showfileinput, setshowfileinput] = useState(false)
  const [key, setkey] = useState("")
  const [value, setvalue] = useState("")
  const [postparams, setpostparams] = useState([]);
  const [consumerKey, setconsumerKey] = useState("")
  const [consumerSecret, setconsumerSecret] = useState("")
  const [launchUrl, setlaunchUrl] = useState("")

  const [oauthnonce, setoauthnonce] = useState("")
  const [signaturemethod, setsignaturemethod] = useState("")
  const [timestamp, settimestamp] = useState("")
  const [oauthversion, setoauthversion] = useState("")
  const [oauthsignature, setoauthsignature] = useState("")

  const formRef = useRef();

  const addParam = () => {
    setpostparams([...postparams, { key: key, value: value }])
  }

  const onChangeAddedFields = (e) => {
    const index = parseInt(e.target.id)
    const value = e.target.value
    const key = e.target.name

    setpostparams([
      ...postparams.slice(0, index),
      { key: key, value: value },
      ...postparams.slice(index+1)
    ])
    
  }

  const removeParam = (e) => {
    const index = parseInt(e.target.id)
    setpostparams(postparams.filter((val, i) => i !== index))
    // setpostparams([
    //   ...postparams.slice(0, index),
    //   ...postparams.slice(index+1)
    // ])
  }

  const launchTP = (e) => {
    if (oauthsignature) {
      formRef.current.submit()
    } else {
      alert("Click on Generate Oauth to generate signature")
    }
    
  }

  const saveToLocalStorage = () => {
    const sessionName = prompt('Enter session name')

    if (sessionName) {
      const session = {
        postparams: postparams,
        consumerKey: consumerKey,
        consumerSecret: consumerSecret,
        launchUrl: launchUrl
      }

      localStorage.setItem(sessionName, JSON.stringify(session));
    }

  }

  const getFromLocalStorage = () => {
    const sessionName = prompt(`Enter session name\n\n ${Object.keys(localStorage).join("\n")}`)

    const session = JSON.parse(localStorage.getItem(sessionName))

    if (session) {
      setpostparams(session.postparams)
      setconsumerKey(session.consumerKey)
      setconsumerSecret(session.consumerSecret)
      setlaunchUrl(session.launchUrl)
    }
  }

  const generateOauth = (e) => {
    e.preventDefault()
    const oauth = require('oauth-sign');
    const timestamp = Math.round(Date.now() / 1000);

    settimestamp(timestamp)
    setoauthnonce(btoa(timestamp))
    setoauthversion('1.0')
    setsignaturemethod('HMAC-SHA1')

    var params = postparams.reduce(function (r, e) {
      r[e.key] = e.value;
      return r;
    }, {});

    params.lti_message_type = 'basic-lti-launch-request'
    params.lti_version = 'LTI-1p0'

    params.oauth_consumer_key = consumerKey
    params.oauth_nonce = btoa(timestamp)
    params.oauth_signature_method = 'HMAC-SHA1'
    params.oauth_timestamp = timestamp
    params.oauth_version = '1.0'

    const signature = oauth.hmacsign('POST', launchUrl, params, consumerSecret);
    params.oauth_signature = signature
    setoauthsignature(signature)
  }

  const fileOnChange =(e)=> {
    const file = e.target.files[0]
    if (file) {
      loadFromFile(file)
    }

  }

  const loadFromFile = (file) => {
      let arr = [];
      readXlsxFile(file).then(data => {
        
        data.map(row => {
          if (row[0] !== "" && !row[0].includes("oauth") && !row[0].includes("lti_message_type") && !row[0].includes("lti_version")) {
            arr = [...arr,  {key: row[0], value: row[1]}]
          }
        })
      }).then(()=> setpostparams(arr))
  }

  return (
    <div className="App">
      <h1>LTI Launch Tool</h1>


      <div className="addElements">
        <input onChange={(e) => setkey(e.target.value)} value={key} type="text" id="key" placeholder="Key" />
        <input onChange={(e) => setvalue(e.target.value)} value={value} type="text" id="value" placeholder="Value" />
        <button onClick={addParam} id="add">ADD</button>
      </div>
      <div className="main">

        <div className="row">
          <label>Launch URL</label>
          <input onChange={(e) => setlaunchUrl(e.target.value)} value={launchUrl} type="text" id="launch_url" />
        </div>
        <div className="row">
          <label>Consumer Secret</label>
          <input onChange={(e) => setconsumerSecret(e.target.value)} value={consumerSecret} type="text" id="consumer_secret" />
        </div>
        <br /><br />



        <form target="_blank" id="ltiForm" method="POST" action={launchUrl} ref={formRef}>

          {/* OAuth Params */}
          <div className="row">
            <label>oauth_consumer_key</label>
            <input onChange={(e) => setconsumerKey(e.target.value)} name="oauth_consumer_key" type="text" value={consumerKey} />
          </div>
          <div className="row">
            <label>oauth_nonce</label>
            <input className="border-red" placeholder="Click Generate Oauth to auto fill" onChange={(e) => setoauthnonce(e.target.value)} name="oauth_nonce" type="text" value={oauthnonce} />
          </div>
          <div className="row">
            <label>oauth_signature_method</label>
            <input className="border-red" placeholder="Click Generate Oauth to auto fill" onChange={(e) => setsignaturemethod(e.target.value)} name="oauth_signature_method" type="text" value={signaturemethod} />
          </div>
          <div className="row">
            <label>oauth_timestamp</label>
            <input className="border-red" placeholder="Click Generate Oauth to auto fill" onChange={(e) => settimestamp(e.target.value)} name="oauth_timestamp" type="text" value={timestamp} />
          </div>
          <div className="row">
            <label>oauth_version</label>
            <input className="border-red" placeholder="Click Generate Oauth to auto fill" onChange={(e) => setoauthversion(e.target.value)} name="oauth_version" type="text" value={oauthversion} />
          </div>
          <div className="row">
            <label>oauth_signature</label>
            <input className="border-red" placeholder="Click Generate Oauth to auto fill" onChange={(e) => setoauthsignature(e.target.value)} name="oauth_signature" type="text" value={oauthsignature} />
          </div>

          <div className="row">
            <label>lti_message_type</label>
            <input name="lti_message_type" type="text" defaultValue="basic-lti-launch-request" />
          </div>
          <div className="row">
            <label>lti_version</label>
            <input name="lti_version" type="text" defaultValue="LTI-1p0" />
          </div>

          {postparams.map((param, index) => (

            <div className="row">
              <label>{param.key}</label>
              <input onChange={onChangeAddedFields} id={index} name={param.key} type="text" value={param.value} />
              <label className="remove" id={index} onClick={removeParam}>x</label>
            </div>
          ))}


        </form>
        <div style={{textAlign:'center'}}>
          <button className="red" onClick={generateOauth}>Generate Oauth</button>
          <button className="green" onClick={launchTP}>Launch TP</button>
          <br/>
          <button className="gray" onClick={saveToLocalStorage}>Save to LocalStorage</button>
          <button className="gray" onClick={getFromLocalStorage}>Load from LocalStorage</button>
          <button className="gray" title="Single Sheet workbook where first column contains the parameter name and &#13; second column contains parameter value" onClick={()=>setshowfileinput(!showfileinput)}>Load from xlsx file</button>
          {showfileinput && <input accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={fileOnChange} type="file" id="file" />}
          
        </div>

      </div>
    </div>
  );
}

export default App;
