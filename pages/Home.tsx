import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { SEO } from '../components/ui/SEO';
import { OptimizedImage } from '../components/ui/OptimizedImage';
import {
  HotelBookingForm,
  TourBookingForm,
  CarBookingForm,
  BusBookingForm,
  QuickBookingModal,
  HotelBookingData,
  CarBookingData,
  BusBookingData,
} from '../components/booking';

export const Home: React.FC = () => {
  const { packages } = useData();
  const [activeTab, setActiveTab] = useState('hotel-booking');
  const navigate = useNavigate();

  // Quick Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'Car' | 'Bus' | 'Hotel' | 'Tour'>('Car');
  const [bookingDetails, setBookingDetails] = useState('');

  // Form handlers
  const handleHotelSubmit = (data: HotelBookingData) => {
    const guestStr = `${data.guests.adults} Adult${data.guests.adults > 1 ? 's' : ''}, ${data.guests.children} Children, ${data.guests.rooms} Room${data.guests.rooms > 1 ? 's' : ''}`;
    setBookingType('Hotel');
    setBookingDetails(`Hotel in ${data.destination}, ${guestStr}`);
    setIsBookingModalOpen(true);
  };

  const handleTourSubmit = (data: { destination: string }) => {
    const query = encodeURIComponent(data.destination.trim());
    navigate(`/packages?search=${query}`);
  };

  const handleCarSubmit = (data: CarBookingData) => {
    setBookingType('Car');
    setBookingDetails(`${data.vehicleType} Rental: ${data.pickupLocation} ${data.sameDropOff ? '(Round Trip)' : `to ${data.dropoffLocation}`}`);
    setIsBookingModalOpen(true);
  };

  const handleBusSubmit = (data: BusBookingData) => {
    setBookingType('Bus');
    setBookingDetails(`Bus from ${data.from} to ${data.to}, ${data.seats} Seat(s)`);
    setIsBookingModalOpen(true);
  };

  // Collections data
  const collections = [
    { title: 'Dreamy Honeymoons', subtitle: 'Romantic escapes tailored for two', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYVi-YbjAoJpXSxi7o30RotV-law43tp_qUcdn-lpApQOPYY6n9_L4bLmtvDSkDgoqfP6daBNyRFpx9djm3y0kveYZ0juGKLD81vCo-MJXHgfYGHxGyc13FmI3tc1s5p4Aw0hYqialshFROqXQIAh0DJOnRyJyZW0F-FmyHvHzXb8wmj_58feRkGHnns8dfnBlVE36-2vFJxJeSWN0j4e4KsJfASqHziYnIiASKdEBJbdAH3bFApvcbfS-Bc31rQa_BGCyzCoUn4H4' },
    { title: 'Adrenaline Adventures', subtitle: 'Thrill-seeking journeys into the wild', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATmrejY5wv4HJwrrT-XOL_k-4PmnUHmnh4tjjQVt_Jw-Yo2zwDrK0qkbFaSFg2oZ4QPuHofCwI5g76BzH8C2PVia4SwkhV7mSizKnFAVWvJ3o-g1OEwmLpMGLVQxjM3imAoioqwI2CrsaGtpVfFii-U7u-sNV--nk7myLX0TMF7KyKkBsLBWBkFkLJdw0Iuddd42GzNf0skyKiejwy7EFQmDIf8GfhitO7eqMnXD1t5P3BqowcJBiS0Flc1nMXXumi-gqaajd5JSWt' },
    { title: 'Family Bonding', subtitle: 'Fun-filled trips for all ages', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPD4VWIRjjm4gr_QRgaRIZ8pQo93GDnfYzDlR9kIXr-4_ovKaMUunDA0hG-FrMzvOD0VPKw7XAJwEUOtDdivx3uWITXO0jqZC_mNA0eKHNJM4D3eHvE34SBmVAet7T_hOJXWXFr_jk15uFbQz7c3rv866ihvaVcCYv7fwsG-96EC2P8qq1OqRTB3RXe_9r1dL0e0aou7sEuPrYf5Va4s6UnXZvlC7HePL_M8zzsQr4IW2s4MRfbquq0greYrr53I3w8OCAB9RTLFbf' },
    { title: 'Cultural Deep Dives', subtitle: 'Immersive heritage experiences', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARvjLJnqBIV09joV5MO4NCFRzmlZ-bbKPc1eoo9A-7TudM37NfT7pwyGWL8SKJsQz3haG3HdOgcYWr0HVXVNhbu-XiaBbvV4rMCx3NcCaiO_eQ9LFJTA69YLnPbsJXp1whEaBMmP7FgfhDhOwfAv7ROqrGj1TfqED1pPb7-eTzxh__HuN-lLTZS3TO3mcaIG5lzHVZPM1aXZvTKyaczGqk0y5JxmYFFC_g3Cd0BZqrPEKe1q-DM-6kkxWzTfUU1rbC62qVacapPJrT' },
  ];

  // Trending destinations
  const trendingTours = [
    { id: 'kerala-backwaters', title: 'Kerala Backwaters', price: '₹35,000', days: '5 Days', loc: 'Kerala, India', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp90RDz-sdjWIaMxCiFRFPO2JsAtK8_dVyOrgkjVXU2eyOfv-QVT0aL8P898Icc29bRifPA2obAWYdG2DUFAu34TSsNNv6AEBb3PkvvVLUy7SiHFhxeAmVHy5JBvY1y3-aVD3CNyS4GknQTya93LHTeT3z7AdLkm9WnOOCJCJKFhwsg0FzrktdLVdl7GvmF40ru8MoKKDLDCnEKa5pwANUTQwYGofMrr6hkRstcsuxW0zFPZrgXEepwClL91yq119GbnN_2TXDnS-4', rating: '4.9' },
    { id: 'manali-escape', title: 'Majestic Manali', price: '₹28,000', days: '6 Days', loc: 'Himachal, India', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw3nTyyZIHE-X4IDz1WIxoLShlt4crH7NAqMA0V0L2ehFuGP9AGiAolK-y2VtcGXQNnGxdEkuHTXyJ44x9J5RiIg5apuiNJV-7xi5I2UV2r-KSd-dgzrATQDbBkFz4UKlFbdF5SgirAYanpbXenNDr-_uktTK_A2FTmUBwhVLQfYFh1gqRN8EoLj-9g8qrA6B21OH52wai00ETSdEUNm2LJQX1poTztcNfmmE2IMrm1oTdfTQ3Sg0DwMSXi2UM_QPDWQt27m2xr8-D', rating: '4.8' },
    { id: 'golden-triangle', title: 'Golden Triangle Tour', price: '₹45,000', days: '6 Days', loc: 'North India', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe8BDAUta_Sad0sbfFPp3eGFuTDne-kjCHaSbEmPIsw2A35eYa_4cmO0qQIrrAUnyuBkmJYYx5BswvQ8xoNvi-V48GV78qtY2osp3mRT5dAgVv31-tcAdYZIYq5VwnghdHN-xLMZHlH8DhevC9MvU-RUVOzTxENfRuR9CornjT44jfRzEHiuwDi6on6RQISv-Sa7xPzXf6U61FblGpi9Ou2aXfsR5_PoyNJhX-aCt1zuv1ogRgtmIOXqYjfcAQ79z48VNTNX3nLemm', rating: '5.0' },
    { id: 'ladakh-adventure', title: 'Leh Ladakh Adventure', price: '₹65,000', days: '8 Days', loc: 'Ladakh, India', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpQiwfKH0yIRycIB8I2oEBy84i-Io3CIha3W5YAJfjpY1Jghiz6KZm9ugQVQh2w1iYR3smMg-3cpUXS07wl7wtOG7tMr-mD3U-5wbABd_2KyTx6jhq4cZAZVjMPjbUU1yxD4LrltucSAO-ZFLoA_ccgWlKW0wsSVrrkrWiCVwGsI8quL38dPZQOPDjQJbUiojqsqXyVKEnZ2jpVDbJw0GE7jrTbRPihr9RoDuW21hmKXYHaB52a6heuHbI7htXFMkWjCPab-3djC20', rating: '4.7' },
  ];

  return (
    <>
      <SEO
        title="Home"
        description="Book handpicked hotels, seamless flights, and immersive tours. Join 50,000+ travelers for unforgettable experiences."
      />

      {/* Quick Booking Modal */}
      <QuickBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        bookingType={bookingType}
        bookingDetails={bookingDetails}
      />

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDe8BDAUta_Sad0sbfFPp3eGFuTDne-kjCHaSbEmPIsw2A35eYa_4cmO0qQIrrAUnyuBkmJYYx5BswvQ8xoNvi-V48GV78qtY2osp3mRT5dAgVv31-tcAdYZIYq5VwnghdHN-xLMZHlH8DhevC9MvU-RUVOzTxENfRuR9CornjT44jfRzEHiuwDi6on6RQISv-Sa7xPzXf6U61FblGpi9Ou2aXfsR5_PoyNJhX-aCt1zuv1ogRgtmIOXqYjfcAQ79z48VNTNX3nLemm"
            alt="Hero Background"
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-900"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center gap-12 text-center pt-32 pb-24 lg:pt-40 lg:pb-32">
          <div className="flex flex-col gap-6 max-w-5xl animate-in slide-in-from-bottom-10 duration-700">
            <h1 className="text-white text-5xl md:text-7xl font-black leading-[1.1] tracking-tight drop-shadow-2xl">
              Don't Just Dream It.{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
                Live It.
              </span>
            </h1>
            <h2 className="text-slate-200 text-lg md:text-2xl font-medium leading-relaxed max-w-3xl mx-auto drop-shadow-lg will-change-transform">
              Unlock exclusive deals on handpicked hotels, seamless flights, and immersive tours. Join 50,000+ travelers.
            </h2>
          </div>

          {/* Booking Widget */}
          <div className="w-full max-w-6xl mt-4 animate-in slide-in-from-bottom-10 duration-1000 delay-200">
            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-black/30 backdrop-blur-md p-1.5 rounded-full inline-flex border border-white/10 shadow-xl overflow-x-auto max-w-full">
                {[
                  { id: 'hotel-booking', icon: 'hotel', label: 'Hotels' },
                  { id: 'tour-packages', icon: 'luggage', label: 'Tours' },
                  { id: 'car-booking', icon: 'directions_car', label: 'Cars' },
                  { id: 'bus-booking', icon: 'directions_bus', label: 'Buses' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 md:px-6 py-3 rounded-full flex items-center gap-2.5 text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-md transform scale-105'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Container */}
            <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 md:p-8 text-left border border-white/20 relative overflow-hidden transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

              {activeTab === 'hotel-booking' && <HotelBookingForm onSubmit={handleHotelSubmit} />}
              {activeTab === 'tour-packages' && <TourBookingForm onSubmit={handleTourSubmit} />}
              {activeTab === 'car-booking' && <CarBookingForm onSubmit={handleCarSubmit} />}
              {activeTab === 'bus-booking' && <BusBookingForm onSubmit={handleBusSubmit} />}
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-12 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-black tracking-tight mb-2">Curated Collections</h2>
              <p className="text-slate-500 dark:text-slate-400 text-base">Handpicked experiences for every type of traveler.</p>
            </div>
            <Link to="/packages" className="hidden md:flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors text-sm">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="flex overflow-x-auto pb-4 gap-4 [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {collections.map((trip, idx) => (
              <div key={idx} onClick={() => navigate('/packages?search=' + encodeURIComponent(trip.title))} className="group cursor-pointer flex-shrink-0 flex flex-col items-center gap-3 min-w-[140px] md:min-w-[180px]">
                <div className="relative size-28 md:size-36 rounded-full overflow-hidden border-[4px] border-white dark:border-slate-800 shadow-xl group-hover:shadow-primary/30 transition-all duration-500 group-hover:-translate-y-1">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <OptimizedImage
                    src={trip.img}
                    alt={trip.title}
                    className="w-full h-full"
                  />
                </div>
                <div className="text-center px-2">
                  <p className="text-slate-900 dark:text-white font-bold text-sm md:text-base group-hover:text-primary transition-colors leading-tight">{trip.title}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium uppercase tracking-wide mt-1 line-clamp-1">{trip.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-10">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Trending Destinations</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Join thousands of travelers exploring these hotspots.</p>
            </div>
            <Link className="hidden md:flex items-center text-primary font-bold hover:underline" to="/packages">
              Explore All
              <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {trendingTours.map((tour, idx) => {
              const pkgData = packages.find(p => p.id === tour.id);
              const remainingSeats = pkgData?.remainingSeats;

              return (
                <Link to={`/packages/${tour.id}`} key={idx} className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-700/50">
                  <div className="relative h-64 overflow-hidden">
                    <OptimizedImage
                      src={tour.img}
                      alt={tour.title}
                      className="w-full h-full group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-yellow-500 text-sm fill">star</span> {tour.rating}
                    </div>

                    {remainingSeats && remainingSeats < 10 && (
                      <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg animate-pulse flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                        Only {remainingSeats} Left
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">{tour.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">schedule</span> {tour.days}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">location_on</span> {tour.loc}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">From</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">{tour.price}</span>
                      </div>
                      <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Book with Us */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 md:px-10 text-center">
          <h2 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black mb-16">The Shravya Advantage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'verified_user', title: 'Book Risk-Free', desc: 'Flexible cancellations and full refunds on most packages.' },
              { icon: 'support_agent', title: '24/7 Expert Support', desc: 'Real humans, always ready to help you, day or night.' },
              { icon: 'diamond', title: 'Handpicked Quality', desc: 'Every experience is vetted for the highest standards.' }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-transform duration-300 border border-slate-100 dark:border-slate-800">
                <div className="size-20 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 group-hover:rotate-6 transition-transform">
                  <span className="material-symbols-outlined text-4xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};