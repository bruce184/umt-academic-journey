from pysnmp.hlapi import (
    getCmd,
    SnmpEngine,
    CommunityData,
    UdpTransportTarget,
    ContextData,
    ObjectType,
    ObjectIdentity
)

def snmp_get(oid, host, community='public', port=161):
    """Thực hiện truy vấn SNMP GET để lấy thông tin từ thiết bị mạng."""
    iterator = getCmd(
        SnmpEngine(),
        CommunityData(community, mpModel=1),  # SNMP v2c
        UdpTransportTarget((host, port)),
        ContextData(),
        ObjectType(ObjectIdentity(oid))
    )

    error_indication, error_status, error_index, var_binds = next(iterator)

    if error_indication:
        print(f"Lỗi: {error_indication}")
    elif error_status:
        print(f"Lỗi SNMP {error_status.prettyPrint()} tại {error_index}")
    else:
        for var_bind in var_binds:
            return var_bind.prettyPrint().split('= ')[1]

    return None


# Thông tin thiết bị
SNMP_HOST = "192.168.1.1"
SNMP_COMMUNITY = "public"

# OID thường dùng
oids = {
    "System Description": "1.3.6.1.2.1.1.1.0",
    "System Uptime": "1.3.6.1.2.1.1.3.0",
    "System Name": "1.3.6.1.2.1.1.5.0",
    "Interface Count": "1.3.6.1.2.1.2.1.0"
}

for key, oid in oids.items():
    value = snmp_get(oid, SNMP_HOST, SNMP_COMMUNITY)
    print(f"{key}: {value}")
