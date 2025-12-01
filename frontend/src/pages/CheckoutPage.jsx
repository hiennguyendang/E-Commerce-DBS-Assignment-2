import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import axiosInstance from '../utils/axiosConfig';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    recipient_name: '',
    address: '',
    phone: '',
    city: 'Hồ Chí Minh',
    postal_code: '',
    country: 'VN'
  });
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const res = await axiosInstance.get('/cart/items');
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('Err load cart:', err);
      setMessage({ text: 'Cannot load cart', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.recipient_name || !form.phone || !form.address || !form.city) {
      setError('Please fill all shipping info!');
      return;
    }

    if (cartItems.length === 0) {
      setError('Cart is empty!');
      return;
    }

    setShowModal(true);
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setError('');
      setShowModal(false);

      const payload = {
        shipping_address: {
          recipient_name: form.recipient_name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postal_code: form.postal_code || '',
          country: form.country || 'VN'
        }
      };

      const res = await axiosInstance.post('/orders', payload);
      setMessage({ text: 'Order created: ' + res.data.order.code, type: 'success' });
      
      setTimeout(() => {
        navigate('/app/orders');
      }, 2000);
      
    } catch (e) {
      console.error('Order failed:', e);
      setError(e?.response?.data?.error || 'Cannot create order');
      setSubmitting(false);
    }
  };

  const calcSub = () => cartItems.reduce((s, i) => s + (i.price * i.quantity), 0);
  const calcShip = () => calcSub() > 500000 ? 0 : 50000;
  const calcTotal = () => calcSub() + calcShip();

  if (loading) return <Spinner message="Loading cart..." />;

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">Checkout</h4>

      {message && (
        <div className={'alert alert-' + (message.type === 'success' ? 'success' : 'danger')}>{message.text}</div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <h5>Cart is empty!</h5>
          <Button label="Continue Shopping" onClick={() => navigate('/')} />
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-7">
            <div className="card mb-4">
              <div className="card-body">
                <h5>Shipping Info</h5>
                <form onSubmit={handleSubmit}>
                  <input type="text" className="form-control mb-2" name="recipient_name" placeholder="Name" value={form.recipient_name} onChange={handleChange} required />
                  <input type="tel" className="form-control mb-2" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
                  <textarea className="form-control mb-2" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
                  <select className="form-select mb-2" name="city" value={form.city} onChange={handleChange} required>
                    <option value="Hồ Chí Minh">HCM</option>
                    <option value="Hà Nội">Hanoi</option>
                  </select>
                  <Button label="Place Order" type="submit" disabled={submitting} />
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card">
              <div className="card-body">
                <h5>Order Summary</h5>
                <p>Subtotal: {calcSub().toLocaleString()}đ</p>
                <p>Shipping: {calcShip() === 0 ? 'Free' : calcShip().toLocaleString() + 'đ'}</p>
                <h4>Total: {calcTotal().toLocaleString()}đ</h4>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} title="Confirm Order">
        <p>Recipient: {form.recipient_name}</p>
        <p>Phone: {form.phone}</p>
        <p>Address: {form.address}, {form.city}</p>
        <h5>Total: {calcTotal().toLocaleString()}đ</h5>
        <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>Confirm</button>
      </Modal>
    </div>
  );
}
