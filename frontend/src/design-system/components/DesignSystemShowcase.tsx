'use client';

import React, { useState } from 'react';
import { Button, IconButton, ButtonGroup } from './Button';
import { Skeleton, CardSkeleton, TableSkeleton, ListSkeleton, ChartSkeleton, Spinner, DotsLoader, ProgressBar, LoadingOverlay } from '@/components/ui/LoadingStates';
import { ErrorState, ServiceUnavailable, NetworkError, FormErrorSummary, FieldError, SuccessState } from '@/components/ui/ErrorStates';
import { FadeInView, StaggeredList, AnimatedCounter, HoverLift, Pulse, Typewriter } from '@/components/ui/AnimatedComponents';
import { useAccessibility, ScreenReaderOnly, SkipLink, Landmark } from '@/accessibility/AccessibilityProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Heart, 
  Star, 
  Settings, 
  RefreshCw, 
  ChevronRight,
  Eye,
  EyeOff,
  Volume2,
  VolumeX
} from 'lucide-react';

export function DesignSystemShowcase() {
  const { settings, updateSetting, announce } = useAccessibility();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counter, setCounter] = useState(0);

  const formErrors = [
    { field: 'email', message: 'Please enter a valid email address' },
    { field: 'password', message: 'Password must be at least 8 characters' },
  ];

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      announce('Loading completed successfully');
    }, 3000);
  };

  const handleErrorDemo = () => {
    setError('Demo error message - service temporarily unavailable');
    setTimeout(() => setError(null), 5000);
  };

  const incrementCounter = () => {
    setCounter(prev => prev + 100);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      {/* Skip Links for Accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#design-tokens">Skip to design tokens</SkipLink>

      {/* Header */}
      <Landmark as="header" role="banner" className="mb-12">
        <FadeInView>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              <Typewriter text="Cadillac EV Design System" speed={50} />
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              A comprehensive, accessible design system showcasing components, animations, and interactions
              optimized for the Cadillac EV Customer Intelligence System.
            </p>
          </div>
        </FadeInView>
      </Landmark>

      {/* Accessibility Controls */}
      <section className="mb-12 p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
        <h2 className="text-2xl font-semibold mb-6">Accessibility Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => updateSetting('highContrast', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span>High Contrast Mode</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span>Reduce Motion</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.largeText}
              onChange={(e) => updateSetting('largeText', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span>Large Text</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.focusIndicators}
              onChange={(e) => updateSetting('focusIndicators', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span>Enhanced Focus</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.announcements}
              onChange={(e) => updateSetting('announcements', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span>Screen Reader Announcements</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.touchAccommodation}
              onChange={(e) => updateSetting('touchAccommodation', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span>Touch Accommodation</span>
          </label>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content">
        {/* Button Showcase */}
        <FadeInView>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Button Components</h2>
            <div className="space-y-8">
              {/* Button Variants */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Button Variants</h3>
                <ButtonGroup spacing="md">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </ButtonGroup>
              </div>

              {/* Button Sizes */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Button Sizes</h3>
                <ButtonGroup spacing="md">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </ButtonGroup>
              </div>

              {/* Button States */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Button States</h3>
                <ButtonGroup spacing="md">
                  <Button leftIcon={<Download className="w-4 h-4" />}>With Left Icon</Button>
                  <Button rightIcon={<ChevronRight className="w-4 h-4" />}>With Right Icon</Button>
                  <Button loading loadingText="Saving...">Loading</Button>
                  <Button disabled>Disabled</Button>
                  <Button fullWidth>Full Width</Button>
                </ButtonGroup>
              </div>

              {/* Icon Buttons */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Icon Buttons</h3>
                <ButtonGroup spacing="md">
                  <IconButton icon={<Heart className="w-4 h-4" />} aria-label="Like" />
                  <IconButton icon={<Star className="w-4 h-4" />} aria-label="Favorite" variant="secondary" />
                  <IconButton icon={<Settings className="w-4 h-4" />} aria-label="Settings" variant="outline" />
                  <IconButton icon={<Eye className="w-4 h-4" />} aria-label="View" variant="ghost" />
                </ButtonGroup>
              </div>
            </div>
          </section>
        </FadeInView>

        {/* Loading States Showcase */}
        <FadeInView direction="left">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Loading States</h2>
            <div className="space-y-8">
              {/* Spinners and Loaders */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Spinners & Loaders</h3>
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <Spinner size="sm" />
                    <p className="text-sm text-neutral-600 mt-2">Small</p>
                  </div>
                  <div className="text-center">
                    <Spinner size="md" />
                    <p className="text-sm text-neutral-600 mt-2">Medium</p>
                  </div>
                  <div className="text-center">
                    <Spinner size="lg" />
                    <p className="text-sm text-neutral-600 mt-2">Large</p>
                  </div>
                  <div className="text-center">
                    <DotsLoader />
                    <p className="text-sm text-neutral-600 mt-2">Dots</p>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Progress Indicators</h3>
                <div className="space-y-4">
                  <ProgressBar value={25} max={100} showLabel label="Upload Progress" />
                  <ProgressBar value={60} max={100} color="success" showLabel label="Data Processing" />
                  <ProgressBar value={85} max={100} color="warning" showLabel label="Optimization" />
                </div>
              </div>

              {/* Skeleton Screens */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Skeleton Screens</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Card Skeleton</h4>
                    <CardSkeleton />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3">List Skeleton</h4>
                    <ListSkeleton items={3} />
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Table Skeleton</h4>
                  <TableSkeleton rows={3} columns={4} />
                </div>
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Chart Skeleton</h4>
                  <ChartSkeleton />
                </div>
              </div>

              {/* Loading Overlay Demo */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Loading Overlay</h3>
                <Button onClick={handleLoadingDemo} disabled={loading}>
                  {loading ? 'Loading...' : 'Demo Loading Overlay'}
                </Button>
                <LoadingOverlay loading={loading} className="mt-4 h-32 border border-neutral-200 rounded">
                  <div className="p-4">
                    <h4 className="font-medium">Sample Content</h4>
                    <p className="text-neutral-600">This content will be overlaid during loading.</p>
                  </div>
                </LoadingOverlay>
              </div>
            </div>
          </section>
        </FadeInView>

        {/* Error States Showcase */}
        <FadeInView direction="right">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Error & Feedback States</h2>
            <div className="space-y-8">
              {/* Error Variants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ErrorState
                  variant="error"
                  title="System Error"
                  description="An unexpected error occurred while processing your request."
                  actions={<Button size="sm">Try Again</Button>}
                />
                <ErrorState
                  variant="warning"
                  title="Connection Warning"
                  description="Your connection seems unstable. Some features may be limited."
                  actions={<Button size="sm" variant="outline">Check Connection</Button>}
                />
                <ErrorState
                  variant="info"
                  title="System Maintenance"
                  description="Scheduled maintenance is in progress. Thank you for your patience."
                />
                <SuccessState
                  title="Operation Successful"
                  description="Your changes have been saved successfully."
                  actions={<Button size="sm" variant="outline">Continue</Button>}
                />
              </div>

              {/* Service Unavailable (No Mock Data) */}
              <ServiceUnavailable
                serviceName="Swiss Federal Commercial Registry (ZEFIX)"
                onRetry={() => announce('Retrying connection to ZEFIX service')}
              />

              {/* Form Errors */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Form Validation</h3>
                <FormErrorSummary errors={formErrors} />
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      className="form-input border-error-500 focus:ring-error-500" 
                      placeholder="Enter your email"
                      aria-invalid="true"
                      aria-describedby="email-error"
                    />
                    <FieldError error="Please enter a valid email address" fieldId="email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Password
                    </label>
                    <input 
                      type="password" 
                      className="form-input border-error-500 focus:ring-error-500" 
                      placeholder="Enter your password"
                      aria-invalid="true"
                      aria-describedby="password-error"
                    />
                    <FieldError error="Password must be at least 8 characters" fieldId="password" />
                  </div>
                </div>
              </div>

              {/* Error Demo */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Error Demo</h3>
                <Button onClick={handleErrorDemo}>Trigger Error</Button>
                {error && (
                  <div className="mt-4">
                    <ErrorState
                      variant="error"
                      title="Demo Error"
                      description={error}
                      actions={<Button size="sm" onClick={() => setError(null)}>Dismiss</Button>}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        </FadeInView>

        {/* Animation Showcase */}
        <FadeInView direction="up">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Animation System</h2>
            <div className="space-y-8">
              {/* Entrance Animations */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Entrance Animations</h3>
                <StaggeredList staggerDelay={150}>
                  {[1, 2, 3, 4, 5].map(item => (
                    <HoverLift key={item}>
                      <Card className="p-4 mb-2">
                        <p>Animated item {item} - Hover for lift effect</p>
                      </Card>
                    </HoverLift>
                  ))}
                </StaggeredList>
              </div>

              {/* Interactive Animations */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Interactive Elements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <HoverLift>
                    <Card className="p-6 text-center cursor-pointer">
                      <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                      <p>Hover Card</p>
                    </Card>
                  </HoverLift>
                  <Pulse color="primary" size="md">
                    <Card className="p-6 text-center">
                      <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <p>Pulse Animation</p>
                    </Card>
                  </Pulse>
                  <Card className="p-6 text-center">
                    <div className="animate-float">
                      <Settings className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    </div>
                    <p>Float Animation</p>
                  </Card>
                </div>
              </div>

              {/* Counter Animation */}
              <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Animated Counter</h3>
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary-600 mb-4">
                    <AnimatedCounter value={counter} prefix="$" suffix="K" decimals={1} />
                  </div>
                  <Button onClick={incrementCounter}>Increment Counter</Button>
                </div>
              </div>
            </div>
          </section>
        </FadeInView>

        {/* Design Tokens Section */}
        <FadeInView>
          <section id="design-tokens" className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Design Tokens</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Colors */}
              <Card>
                <CardHeader>
                  <CardTitle>Colors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded bg-primary-500"></div>
                      <span className="text-sm">Primary</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded bg-success-500"></div>
                      <span className="text-sm">Success</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded bg-warning-500"></div>
                      <span className="text-sm">Warning</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded bg-error-500"></div>
                      <span className="text-sm">Error</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Typography */}
              <Card>
                <CardHeader>
                  <CardTitle>Typography</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">Heading 1</p>
                    <p className="text-2xl font-semibold">Heading 2</p>
                    <p className="text-xl font-medium">Heading 3</p>
                    <p className="text-base">Body text</p>
                    <p className="text-sm text-neutral-600">Small text</p>
                  </div>
                </CardContent>
              </Card>

              {/* Spacing */}
              <Card>
                <CardHeader>
                  <CardTitle>Spacing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="bg-primary-100 h-2 w-8"></div>
                    <div className="bg-primary-200 h-2 w-12"></div>
                    <div className="bg-primary-300 h-2 w-16"></div>
                    <div className="bg-primary-400 h-2 w-20"></div>
                    <div className="bg-primary-500 h-2 w-24"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </FadeInView>

        {/* Status Indicators */}
        <FadeInView>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Status Indicators</h2>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Error</Badge>
                <Badge variant="outline">Outline</Badge>
                <div className="badge badge-success">Success</div>
                <div className="badge badge-warning">Warning</div>
                <div className="badge badge-neutral">Neutral</div>
              </div>
            </div>
          </section>
        </FadeInView>
      </main>

      {/* Screen Reader Information */}
      <ScreenReaderOnly>
        <p>
          This design system showcase demonstrates accessible components with proper ARIA labels,
          keyboard navigation, and screen reader support. All animations respect reduced motion preferences.
        </p>
      </ScreenReaderOnly>

      {/* Footer */}
      <Landmark as="footer" role="contentinfo" className="mt-16 py-8 border-t border-neutral-200">
        <div className="text-center text-neutral-600">
          <p>Cadillac EV Customer Intelligence System - Design System Showcase</p>
          <p className="text-sm mt-2">Built with accessibility and performance in mind</p>
        </div>
      </Landmark>
    </div>
  );
}