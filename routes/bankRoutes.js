const express = require('express');
const router = express.Router();
const BankConfig = require('../models/BankConfig');

// 1. Naya Bank Create karna (With initial products or empty)
router.post('/add-bank', async (req, res) => {
  try {
    const newBank = new BankConfig(req.body);
    await newBank.save();
    res.status(201).json({ success: true, message: 'Bank successfully added', data: newBank });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Master Portal Dashboard ke liye saare Banks aur unki Policies lana
router.get('/all-banks', async (req, res) => {
  try {
    const banks = await BankConfig.find();
    res.status(200).json({ success: true, data: banks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Directly Dynamic Product & Policy Add karna kisi Bank me
router.post('/:bankId/add-product', async (req, res) => {
  try {
    const bank = await BankConfig.findById(req.params.bankId);
    if (!bank) return res.status(404).json({ success: false, message: 'Bank not found' });

    // Request body se naya product push karein
    bank.products.push(req.body);
    await bank.save();

    res.status(200).json({ success: true, message: 'New Product Policy Added!', data: bank });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Specific Product Policy ko Update karna (Master Portal se)
router.put('/:bankId/update-product/:productId', async (req, res) => {
  try {
    const bank = await BankConfig.findById(req.params.bankId);
    if (!bank) return res.status(404).json({ success: false, message: 'Bank not found' });

    // Matching product dhoond ke update karo
    const product = bank.products.id(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    Object.assign(product, req.body);
    await bank.save();

    res.status(200).json({ success: true, message: 'Product Policy Updated!', data: bank });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Product Delete karna (Bank ke andar se)
router.delete('/:bankId/delete-product/:productId', async (req, res) => {
  try {
    const bank = await BankConfig.findById(req.params.bankId);
    if (!bank) return res.status(404).json({ success: false, message: 'Bank not found' });

    bank.products.pull({ _id: req.params.productId });
    await bank.save();

    res.status(200).json({ success: true, message: 'Product removed successfully', data: bank });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;