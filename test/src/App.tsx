import React, { useEffect, useState } from 'react';
import PDFViewer, { InputLocation } from './document/document';

import './App.css';

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
      headers: { 'Accept': 'application/pdf', 'Content-Type': 'application/pdf' }
    })

    return await pdfFetch.arrayBuffer();
  }

  return (
    <div>
      {!loaded ?
        null
        :
        <PDFViewer
          style={{ height: "100vh" }}
          file={pdfFile}
          options={{
            scale: 1.2,
            pageGap: 15,
            multiPageSizeLimitKB: 200,
            startPage: 1,
            onDocumentSaved: (file: Uint8Array, inputs: InputLocation[]) => {
              console.log({
                file,
                inputs
              })
            },
            onDocumentLoaded: () => { console.log("Loaded") }
          }}
        />
      }
    </div >
  );
}
