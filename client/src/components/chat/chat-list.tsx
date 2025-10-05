import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ExchangeWithDetails } from "../../types";

interface ChatListProps {
  exchanges: ExchangeWithDetails[];
  onSelectExchange: (exchangeId: string) => void;
}

export default function ChatList({ exchanges, onSelectExchange }: ChatListProps) {
  const activeExchanges = exchanges.filter(e => e.status === "active");

  const getInitials = (firstName: string = "", lastName: string = "") => {
    return (firstName[0] || "") + (lastName[0] || "");
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-indigo-500 to-blue-600",
      "from-emerald-500 to-teal-600", 
      "from-rose-500 to-pink-600"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="w-1/3 border-r border-gray-200 bg-white">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
        <div className="relative">
          <Input
            placeholder="Search conversations..."
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="overflow-y-auto h-full">
        <div className="p-4 space-y-2">
          {activeExchanges.length > 0 ? (
            activeExchanges.map((exchange, index) => {
              const otherUser = exchange.requester?.id !== exchange.requesterId 
                ? exchange.requester 
                : exchange.requestedUser;
              const siteName = exchange.requestedSite?.domain || "Unknown site";
              
              return (
                <div
                  key={exchange.id}
                  className="p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelectExchange(exchange.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${getGradientClass(index)} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">
                        {getInitials(otherUser?.firstName, otherUser?.lastName)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 truncate">
                          {otherUser?.firstName} {otherUser?.lastName}
                        </h4>
                        <span className="text-xs text-gray-500">2h</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{siteName} exchange</p>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        Click to view conversation...
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No active conversations</p>
              <p className="text-sm text-gray-400 mt-1">
                Accept exchange requests to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
