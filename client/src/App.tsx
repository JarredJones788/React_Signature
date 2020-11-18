import React, { useEffect, useState } from 'react';
import Document from './components/document/document';

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
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    return await pdfFetch.arrayBuffer();
  }


  return (
    <div>
      {!loaded ?
        null
        :
        <Document
          style={{ padding: "20px", height: "calc(100vh - 40px)" }}
          file={pdfFile}
          multiPageSizeLimitKB={200}
          options={{
            scale: 1.2,
            pageGap: 15
          }}
        />
      }
    </div >
  );
}
