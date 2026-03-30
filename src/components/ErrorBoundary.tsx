import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    const { children } = (this as any).props;
    if ((this as any).state.hasError) {
      let errorMessage = "Something went wrong.";
      errorMessage = (this as any).state.error?.message || errorMessage;

      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 text-center">
          <div className="max-w-md space-y-6">
            <h1 className="text-4xl font-bold text-[#FB2965]">Oops!</h1>
            <p className="text-gray-500">{errorMessage}</p>
            <Button
              variant="gradient"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return children;
  }
}
