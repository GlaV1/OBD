import 'package:go_router/go_router.dart';
import '../screens/vehicle/vehicle_screen.dart';
import '../screens/connect/connect_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/live_data/live_data_screen.dart';
import '../screens/live_data/live_data_selection_screen.dart';
import '../screens/fault_codes/fault_codes_screen.dart';
import '../screens/freeze_frame/freeze_frame_screen.dart';
import '../screens/readiness/readiness_screen.dart';
import '../screens/service_reset/service_reset_screen.dart';
import '../screens/vehicle_info/vehicle_info_screen.dart';
import '../screens/appointments/appointments_screen.dart';
import '../screens/appointments/appointment_detail_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../services/appointment_service.dart';

final appRouter = GoRouter(
  initialLocation: '/vehicle',
  routes: [
    GoRoute(path: '/vehicle', builder: (_, _) => const VehicleScreen()),
    GoRoute(path: '/connect', builder: (_, _) => const ConnectScreen()),
    GoRoute(path: '/dashboard', builder: (_, _) => const DashboardScreen()),
    GoRoute(path: '/live-data', builder: (_, _) => const LiveDataScreen()),
    GoRoute(path: '/live-data-selection', builder: (_, _) => const LiveDataSelectionScreen()),
    GoRoute(path: '/fault-codes', builder: (_, _) => const FaultCodesScreen()),
    GoRoute(path: '/freeze-frame', builder: (_, _) => const FreezeFrameScreen()),
    GoRoute(path: '/readiness', builder: (_, _) => const ReadinessScreen()),
    GoRoute(path: '/service-reset', builder: (_, _) => const ServiceResetScreen()),
    GoRoute(path: '/vehicle-info', builder: (_, _) => const VehicleInfoScreen()),
    GoRoute(path: '/appointments', builder: (_, _) => const AppointmentsScreen()),
    GoRoute(
      path: '/appointment-detail',
      builder: (_, state) => AppointmentDetailScreen(
        appointment: state.extra as Appointment,
      ),
    ),
    GoRoute(path: '/settings', builder: (_, _) => const SettingsScreen()),
  ],
);
