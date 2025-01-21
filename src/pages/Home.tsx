import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { History } from "lucide-react";

// Mock food recommendations with Indian food images
const mockRecommendations = [
  { 
    id: 1, 
    name: "Butter Chicken", 
    description: "Creamy, rich curry with tender chicken",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 2, 
    name: "Paneer Tikka", 
    description: "Grilled cottage cheese with spices",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 3, 
    name: "Biryani", 
    description: "Fragrant rice dish with aromatic spices",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 4, 
    name: "Dal Makhani", 
    description: "Creamy black lentils cooked overnight",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 5, 
    name: "Samosa", 
    description: "Crispy pastry with spiced potato filling",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 6, 
    name: "Palak Paneer", 
    description: "Cottage cheese in spinach gravy",
    image: "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 7, 
    name: "Chole Bhature", 
    description: "Spiced chickpeas with fried bread",
    image: "https://images.unsplash.com/photo-1626132647523-66c6bc3f6d2f?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 8, 
    name: "Dosa", 
    description: "Crispy rice crepe with potato filling",
    image: "https://images.unsplash.com/photo-1625398407796-82650a8c9285?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 9, 
    name: "Gulab Jamun", 
    description: "Sweet milk dumplings in sugar syrup",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 10, 
    name: "Tandoori Roti", 
    description: "Whole wheat bread baked in clay oven",
    image: "https://images.unsplash.com/photo-1626132600068-49c1f1a6c3c8?auto=format&fit=crop&w=800&q=80"
  }
];

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recommendations] = useState(mockRecommendations);

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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Indian Cuisine</h1>
          <div className="flex gap-4">
            <Button 
              onClick={() => navigate("/recent-orders")}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Recent Orders
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendations.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-40 w-full">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <Button 
                  onClick={() => handleOrder(item.name)}
                  className="w-full"
                >
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