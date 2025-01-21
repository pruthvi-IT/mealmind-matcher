import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

const RecentOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to view your orders.",
        });
        navigate("/");
      }
    };
    checkUser();
  }, [navigate, toast]);

  // Fetch user's orders with proper error handling
  const { data: orders, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return data;
    },
    retry: 1,
  });

  // Show error state if query fails
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/home")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Failed to load orders</h2>
            <p className="text-gray-600 mt-2">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  const handleOrder = async (foodItem: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to place orders.",
        });
        return;
      }

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/home")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Recent Orders</h1>
        </div>

        <div className="grid gap-4">
          {orders?.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <h3 className="font-semibold">{order.food_item}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button onClick={() => handleOrder(order.food_item)}>
                  Order Again
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {orders?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;