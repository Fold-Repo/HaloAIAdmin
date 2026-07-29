import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { ROUTES } from '@/constants';
import {
  ForgotPasswordPage,
  LoginPage,
  OnboardingPage,
  OtpVerificationPage,
  RegisterPage,
  UnauthorizedPage,
} from '@/features/authentication/pages';
import {
  OnboardingRoute,
  ProtectedRoute,
  PublicRoute,
} from '@/features/authentication/routes/ProtectedRoute';
import { RoleRoute } from '@/features/authentication/routes/RoleRoute';
import { AuthLayout, CreatorLayout, MainLayout } from '@/layouts';

const HomePage = lazy(() =>
  import('@/app/pages/HomePage').then((m) => ({ default: m.HomePage })),
);

const CreatorDashboardPage = lazy(() =>
  import('@/features/creator/pages/CreatorDashboardPage').then((m) => ({
    default: m.CreatorDashboardPage,
  })),
);

const ProjectsPage = lazy(() =>
  import('@/features/creator/pages/ProjectsPage').then((m) => ({
    default: m.ProjectsPage,
  })),
);

const NewProjectPage = lazy(() =>
  import('@/features/creator/pages/NewProjectPage').then((m) => ({
    default: m.NewProjectPage,
  })),
);

const ProjectDetailPage = lazy(() =>
  import('@/features/creator/pages/ProjectDetailPage').then((m) => ({
    default: m.ProjectDetailPage,
  })),
);

const SeriesPage = lazy(() =>
  import('@/features/creator/pages/SeriesPage').then((m) => ({
    default: m.SeriesPage,
  })),
);

const SeriesDetailPage = lazy(() =>
  import('@/features/creator/pages/SeriesDetailPage').then((m) => ({
    default: m.SeriesDetailPage,
  })),
);

const SeasonsPage = lazy(() =>
  import('@/features/creator/pages/SeasonsPage').then((m) => ({
    default: m.SeasonsPage,
  })),
);

const NotificationsPage = lazy(() =>
  import('@/features/creator/pages/NotificationsPage').then((m) => ({
    default: m.NotificationsPage,
  })),
);

const StoryComposerPage = lazy(() =>
  import('@/features/story-bible/pages/StoryComposerPage').then((m) => ({
    default: m.StoryComposerPage,
  })),
);

const StoryBiblePage = lazy(() =>
  import('@/features/story-bible/pages/StoryBiblePage').then((m) => ({
    default: m.StoryBiblePage,
  })),
);

const EpisodesPage = lazy(() =>
  import('@/features/episode-planner/pages/EpisodesPage').then((m) => ({
    default: m.EpisodesPage,
  })),
);

const EpisodeDetailPage = lazy(() =>
  import('@/features/episode-planner/pages/EpisodeDetailPage').then((m) => ({
    default: m.EpisodeDetailPage,
  })),
);

const AiGenerationPage = lazy(() =>
  import('@/features/ai-generation/pages/AiGenerationPage').then((m) => ({
    default: m.AiGenerationPage,
  })),
);

const RenderingPage = lazy(() =>
  import('@/features/rendering/pages/RenderingPage').then((m) => ({
    default: m.RenderingPage,
  })),
);

const PublishingPage = lazy(() =>
  import('@/features/publishing/pages/PublishingPage').then((m) => ({
    default: m.PublishingPage,
  })),
);

const AnalyticsPage = lazy(() =>
  import('@/features/analytics/pages/AnalyticsPage').then((m) => ({
    default: m.AnalyticsPage,
  })),
);

const AdminPortalPage = lazy(() =>
  import('@/features/admin/pages/AdminPortalPage').then((m) => ({
    default: m.AdminPortalPage,
  })),
);

const TutorialPage = lazy(() =>
  import('@/features/tutorial/pages/TutorialPage').then((m) => ({
    default: m.TutorialPage,
  })),
);

const AiSettingsPage = lazy(() =>
  import('@/features/ai-generation/pages/AiSettingsPage').then((m) => ({
    default: m.AiSettingsPage,
  })),
);

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: ROUTES.HOME,
        element: <HomePage />,
      },
      {
        path: ROUTES.TUTORIAL,
        element: <TutorialPage />,
      },
      {
        path: ROUTES.UNAUTHORIZED,
        element: <UnauthorizedPage />,
      },
      {
        element: <OnboardingRoute />,
        children: [
          {
            path: ROUTES.ONBOARDING,
            element: <OnboardingPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <RoleRoute roles={['admin']} />,
            children: [
              {
                path: ROUTES.ADMIN,
                element: <Navigate to="overview" replace />,
              },
              {
                path: ROUTES.ADMIN_SECTION,
                element: <AdminPortalPage />,
              },
            ],
          },
        ],
      },
      {
        path: ROUTES.NOT_FOUND,
        element: <NotFoundPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute roles={['creator', 'admin']} />,
        children: [
          {
            element: <CreatorLayout />,
            children: [
              {
                path: ROUTES.DASHBOARD,
                element: <CreatorDashboardPage />,
              },
              {
                path: ROUTES.STUDIO.PROJECTS,
                element: <ProjectsPage />,
              },
              {
                path: ROUTES.STUDIO.PROJECT_NEW,
                element: <NewProjectPage />,
              },
              {
                path: ROUTES.STUDIO.PROJECT_DETAIL,
                element: <ProjectDetailPage />,
              },
              {
                path: ROUTES.STUDIO.STORY_COMPOSER,
                element: <StoryComposerPage />,
              },
              {
                path: ROUTES.STUDIO.STORY_BIBLE,
                element: <Navigate to="overview" replace />,
              },
              {
                path: ROUTES.STUDIO.STORY_BIBLE_SECTION,
                element: <StoryBiblePage />,
              },
              {
                path: ROUTES.STUDIO.EPISODES,
                element: <EpisodesPage />,
              },
              {
                path: ROUTES.STUDIO.EPISODE_DETAIL,
                element: <EpisodeDetailPage />,
              },
              {
                path: ROUTES.STUDIO.AI,
                element: <Navigate to="dashboard" replace />,
              },
              {
                path: ROUTES.STUDIO.AI_SECTION,
                element: <AiGenerationPage />,
              },
              {
                path: ROUTES.STUDIO.RENDERING,
                element: <Navigate to="progress" replace />,
              },
              {
                path: ROUTES.STUDIO.RENDERING_SECTION,
                element: <RenderingPage />,
              },
              {
                path: ROUTES.STUDIO.PUBLISHING,
                element: <Navigate to="wizard" replace />,
              },
              {
                path: ROUTES.STUDIO.PUBLISHING_SECTION,
                element: <PublishingPage />,
              },
              {
                path: ROUTES.STUDIO.ANALYTICS,
                element: <Navigate to="dashboard" replace />,
              },
              {
                path: ROUTES.STUDIO.ANALYTICS_SECTION,
                element: <AnalyticsPage />,
              },
              {
                path: ROUTES.STUDIO.SERIES,
                element: <SeriesPage />,
              },
              {
                path: ROUTES.STUDIO.SERIES_DETAIL,
                element: <SeriesDetailPage />,
              },
              {
                path: ROUTES.STUDIO.SEASONS,
                element: <SeasonsPage />,
              },
              {
                path: ROUTES.STUDIO.NOTIFICATIONS,
                element: <NotificationsPage />,
              },
              {
                path: ROUTES.STUDIO.TUTORIAL,
                element: <TutorialPage />,
              },
              {
                path: ROUTES.STUDIO.AI_SETTINGS,
                element: <AiSettingsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            path: ROUTES.LOGIN,
            element: <LoginPage />,
          },
          {
            path: ROUTES.REGISTER,
            element: <RegisterPage />,
          },
          {
            path: ROUTES.FORGOT_PASSWORD,
            element: <ForgotPasswordPage />,
          },
        ],
      },
      {
        path: ROUTES.OTP_VERIFICATION,
        element: <OtpVerificationPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.NOT_FOUND} replace />,
  },
]);
