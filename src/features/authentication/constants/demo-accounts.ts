import { DEMO_LOGIN } from '@/features/tutorial/content/tutorial-content';

export type DemoAccount = {
  label: string;
  email: string;
  password: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Creator',
    email: DEMO_LOGIN.creator.email,
    password: DEMO_LOGIN.creator.password,
  },
  {
    label: 'Admin',
    email: DEMO_LOGIN.admin.email,
    password: DEMO_LOGIN.admin.password,
  },
];
