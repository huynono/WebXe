// components/Home.tsx
import React from 'react';
import Hero from './Hero';
import FeaturedCars from './FeaturedCars';
import Services from './Services';
import Footer from './Footer';
import Header from './Header';
import FeaturedCategories from './FeaturedCategoris';
import FeaturedVoucher from './FeaturedVoucher';
import ChatWidget from './ChatWidget';
// import thêm các section khác nếu có

const Home = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <FeaturedCategories /> 
      <FeaturedCars />
      <FeaturedVoucher />
      <Services />
      <Footer />
      <ChatWidget />
      {/* Thêm các phần khác như Contact, Footer... */}
    </div>
  );
};

export default Home;
