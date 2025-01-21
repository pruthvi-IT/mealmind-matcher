import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { History, LogOut } from "lucide-react";

// Food items with correctly matched images
const mockRecommendations = [
  { 
    id: 1, 
    name: "Butter Chicken", 
    description: "Creamy, rich curry with tender chicken",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80"
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
    name: "Naan", 
    description: "Traditional Indian flatbread",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 7, 
    name: "Chicken Tikka", 
    description: "Grilled marinated chicken pieces",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 8, 
    name: "Masala Dosa", 
    description: "Crispy rice crepe with spiced potato filling",
    image: "https://images.unsplash.com/photo-1625398407796-82650a8c9285?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 9, 
    name: "Palak Paneer", 
    description: "Cottage cheese in spinach gravy",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80"
  },
  { 
    id: 10, 
    name: "Mixed Vegetable Curry", 
    description: "Assorted vegetables in aromatic curry sauce",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80"
  }
];

const Home: React.FC = () => {
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
    <div className="min-h-screen bg-gray-50">
      {/* AppBar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-primary">Food Buddy</h1>
            <div className="flex gap-2 sm:gap-4">
              <Button 
                variant="outline"
                onClick={() => navigate("/recent-orders")}
                className="flex items-center gap-2 text-sm sm:text-base"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Recent Orders</span>
              </Button>
              <Button 
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm sm:text-base"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendations.map((item) => (
            <Card 
              key={item.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="relative h-48 w-full">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
                  }}
                />
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-1">{item.description}</p>
                <Button 
                  onClick={() => handleOrder(item.name)}
                  className="w-full mt-auto"
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