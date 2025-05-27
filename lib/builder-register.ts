import { builder, BuilderComponent, Builder } from '@builder.io/react';
import { Hero } from '../components/Hero'; // adjust the path if needed

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

Builder.registerComponent(Hero, {
  name: 'Hero Section',
  inputs: [
    { name: 'title', type: 'text', defaultValue: '1999CHAMPCUTZ' },
    { name: 'subtitle', type: 'text', defaultValue: 'Premium barbershop experience with skilled professionals dedicated to perfecting your style' },
    { name: 'buttonText', type: 'text', defaultValue: 'Book Now' },
  ],
});
