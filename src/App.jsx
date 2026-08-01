import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import DocxGenerator from './DocxGenerator';
import WaitlistModal from './WaitlistModal';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo" element={<DocxGenerator />} />
      </Routes>
      <WaitlistModal />
    </BrowserRouter>
  );
}
