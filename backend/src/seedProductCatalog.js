const mongoose = require('mongoose');
const ProductCatalog = require('./models/ProductCatalog');
const connectDB = require('./config/db');

const products = [
  {
    name: 'Zoss Countertop Ionizer',
    description: 'Compact and powerful alkaline water ionizer perfect for kitchens and small spaces',
    price: 25000,
    category: 'B2C',
    imageUrl: '/lovable-uploads/622f2f9b-d2f1-4f0c-ac4f-656dca514723.png',
    features: [
      '7 platinum-coated titanium electrodes',
      'Advanced filtration system',
      'Digital pH display',
      'Self-cleaning function',
      'Voice prompts',
      'Compact design'
    ],
    specifications: {
      'pH Range': '8.5 - 11.0',
      'ORP Range': '-400mV to -800mV',
      'Flow Rate': '1.5 - 4.0 L/min',
      'Power Consumption': '120W',
      'Dimensions': '32cm x 15cm x 35cm',
      'Weight': '4.5 kg',
      'Warranty': '5 Years',
      'Installation': 'Countertop'
    },
    brochureUrl: '#'
  },
  {
    name: 'Zoss Under-Sink Ionizer',
    description: 'Hidden installation ionizer with high flow rate for seamless kitchen integration',
    price: 45000,
    category: 'B2C',
    imageUrl: '/lovable-uploads/e2461f2f-96be-4a69-ad60-df4433dd50ce.png',
    features: [
      '9 platinum-coated titanium electrodes',
      'Professional-grade filtration',
      'LCD control panel',
      'Automatic cleaning cycle',
      'High flow rate',
      'Hidden installation'
    ],
    specifications: {
      'pH Range': '8.0 - 11.5',
      'ORP Range': '-500mV to -900mV',
      'Flow Rate': '2.0 - 6.0 L/min',
      'Power Consumption': '150W',
      'Dimensions': '38cm x 20cm x 40cm',
      'Weight': '6.8 kg',
      'Warranty': '7 Years',
      'Installation': 'Under-Sink'
    },
    brochureUrl: '#'
  },
  {
    name: 'Zoss Atlanta',
    description: 'Premium commercial-grade ionizer for professional and high-volume applications',
    price: 159000,
    category: 'B2B',
    imageUrl: '/lovable-uploads/91d71d34-d5aa-44bb-8185-e5698d380783.png',
    features: [
      '11 platinum-coated titanium electrodes',
      'Commercial-grade components',
      'Touch screen interface',
      'Smart diagnostics',
      'High-volume capacity',
      'Professional installation'
    ],
    specifications: {
      'pH Range': '7.5 - 12.0',
      'ORP Range': '-600mV to -1000mV',
      'Flow Rate': '3.0 - 8.0 L/min',
      'Power Consumption': '200W',
      'Dimensions': '45cm x 25cm x 50cm',
      'Weight': '12.5 kg',
      'Warranty': '10 Years',
      'Installation': 'Professional'
    },
    brochureUrl: '#'
  }
];

async function seed() {
  await connectDB();
  await ProductCatalog.deleteMany({});
  await ProductCatalog.insertMany(products);
  console.log('Product catalog seeded!');
  process.exit();
}

seed();