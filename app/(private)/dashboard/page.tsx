import { BarChart3, Calendar, Clock, FileText, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='font-bold text-3xl tracking-tight'>Bảng điều khiển</h2>
      </div>

      {/* Welcome Section */}
      <div className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'>
        <h3 className='mb-2 font-semibold text-xl'>Chào mừng đến với Hệ thống Quản lý Thời gian Thuyết trình</h3>
        <p className='text-muted-foreground'>
          Hệ thống quản lý và đánh giá thời gian thuyết trình dành cho Khoa Công nghệ Thông tin - Trường Đại học Mở
          TP.HCM
        </p>
      </div>

      {/* Instructions Section */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Hướng dẫn sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-sm'>
              <p className='font-medium'>1. Tạo sự kiện mới</p>
              <p className='text-muted-foreground'>Thiết lập thông tin cuộc thi và thời gian</p>
            </div>
            <div className='text-sm'>
              <p className='font-medium'>2. Quản lý đội thi</p>
              <p className='text-muted-foreground'>Thêm các đội tham gia và thành viên</p>
            </div>
            <div className='text-sm'>
              <p className='font-medium'>3. Thiết lập tiêu chí</p>
              <p className='text-muted-foreground'>Cấu hình tiêu chí chấm điểm</p>
            </div>
            <div className='text-sm'>
              <p className='font-medium'>4. Bắt đầu thuyết trình</p>
              <p className='text-muted-foreground'>Điều khiển thời gian và theo dõi tiến độ</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Truy cập nhanh</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <p className='text-muted-foreground text-sm'>
              Sử dụng thanh sidebar bên trái để di chuyển giữa các chức năng:
            </p>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>
                  <strong>Sự kiện:</strong> Tạo và quản lý cuộc thi
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                <span>
                  <strong>Thuyết trình:</strong> Điều khiển thời gian
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <BarChart3 className='h-4 w-4' />
                <span>
                  <strong>Đánh giá:</strong> Chấm điểm đội thi
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4' />
                <span>
                  <strong>Người dùng:</strong> Quản lý tài khoản
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
