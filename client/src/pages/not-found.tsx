import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
      <Card className="w-full max-w-md mx-4 border-slate-700 bg-slate-800">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <h1 className="text-2xl font-bold text-slate-100">404 Page not found</h1>
          </div>

          <p className="mt-4 mb-6 text-sm text-slate-400">
            La page demandée n'existe pas ou a été déplacée. Revenez à l'accueil pour continuer.
          </p>

            <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
          </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
