import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import Document from './components/document/document';

export default function App() {

  const [pdfFile, setPDFFile] = useState(new ArrayBuffer(0))
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchPDFDocument().then((data) => {
      setPDFFile(data)
      setLoaded(true);
    })
  }, [])

  async function fetchPDFDocument() {
    const pdfFetch = await fetch(`http://localhost:3000/pdf/test.pdf`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    return await pdfFetch.arrayBuffer();
  }


  return (
    <div style={{ padding: "20px", height: "calc(100vh - 40px)" }}>
      {!loaded ?
        null
        :
        <BrowserRouter>
          <Switch>
            <Route path="/" render={(p: any) => <Document file={pdfFile} />} exact />
          </Switch>
        </BrowserRouter>
      }
    </div >
  );
}
