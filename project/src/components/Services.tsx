import React from 'react';
import { Shield, Wrench, CreditCard, Headphones } from 'lucide-react';

const services = [
  {
    icon: Shield,
    title: 'Bảo Hành Chính Hãng',
    description: 'Bảo hành toàn diện với dịch vụ chăm sóc khách hàng 24/7',
    color: 'blue'
  },
  {
    icon: Wrench,
    title: 'Bảo Dưỡng Định Kỳ',
    description: 'Dịch vụ bảo dưỡng chuyên nghiệp với kỹ thuật viên giàu kinh nghiệm',
    color: 'green'
  },
  {
    icon: CreditCard,
    title: 'Hỗ Trợ Vay Ngân Hàng',
    description: 'Thủ tục nhanh chóng, lãi suất ưu đãi từ các ngân hàng uy tín',
    color: 'purple'
  },
  {
    icon: Headphones,
    title: 'Tư Vấn 24/7',
    description: 'Đội ngũ tư vấn viên nhiệt tình, sẵn sàng hỗ trợ mọi lúc',
    color: 'red'
  }
];

const Services = () => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Dịch Vụ <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Của Chúng Tôi</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cung cấp dịch vụ toàn diện từ bán hàng đến hậu mãi, đảm bảo sự hài lòng tối đa cho khách hàng
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="group text-center">
                {/* Icon Container */}
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className={`w-full h-full bg-gradient-to-br ${getColorClasses(service.color)} rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Decorative Ring */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(service.color)} rounded-2xl opacity-20 scale-125 group-hover:scale-150 transition-transform duration-300`}></div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Why Choose Us Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl p-12 text-white">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Tại Sao Chọn VinFast</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Giá cả cạnh tranh nhất thị trường</h4>
                      <p className="text-gray-300">Cam kết mức giá tốt nhất với nhiều ưu đãi hấp dẫn</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Chất lượng được kiểm định</h4>
                      <p className="text-gray-300">Mọi xe đều được kiểm tra kỹ lưỡng bởi chuyên gia</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Dịch vụ hậu mãi tận tâm</h4>
                      <p className="text-gray-300">Hỗ trợ khách hàng suốt quá trình sử dụng</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <img
                  src="https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Happy Customer"
                  className="w-full h-64 object-cover rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;