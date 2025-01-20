import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

// Mock food recommendations with images
const mockRecommendations = [
  { 
    id: 1, 
    name: "Grilled Salmon", 
    description: "Fresh salmon with herbs and lemon",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 2, 
    name: "Quinoa Bowl", 
    description: "Healthy grain bowl with roasted vegetables",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 3, 
    name: "Chicken Stir-Fry", 
    description: "Asian-inspired chicken with seasonal vegetables",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 4, 
    name: "Mediterranean Salad", 
    description: "Fresh salad with feta, olives, and vinaigrette",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80"
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recommendations] = useState(mockRecommendations);

  // Check authentication on page load
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Checking user session:", session);
      if (!session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  // Fetch user's orders
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
      
      return data;
    },
  });

  const handleOrder = async (foodItem: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log("No user session found");
        return;
      }

      console.log("Placing order for:", foodItem);
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
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
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

        {orders && orders.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Your Recent Orders</h2>
            <div className="space-y-2">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="py-4">
                    <p>{order.food_item}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;