import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Mock food recommendations - can be replaced with real algorithm later
const mockRecommendations = [
  { id: 1, name: "Grilled Salmon", description: "Fresh salmon with herbs" },
  { id: 2, name: "Quinoa Bowl", description: "Healthy grain bowl with vegetables" },
  { id: 3, name: "Chicken Stir-Fry", description: "Asian-inspired chicken with vegetables" },
  { id: 4, name: "Mediterranean Salad", description: "Fresh salad with feta and olives" },
];

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState(mockRecommendations);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleOrder = async (foodItem: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('orders')
        .insert([{ food_item: foodItem, user_id: session.user.id }]);

      if (error) throw error;

      toast({
        title: "Order placed!",
        description: `Your order for ${foodItem} has been placed successfully.`,
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to place order. Please try again.",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Recommended for You</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <Button onClick={() => handleOrder(item.name)}>
                  Order Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;