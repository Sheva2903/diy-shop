import boto3

client = boto3.client('ec2', region_name='ap-southeast-2')

response1 = client.create_vpc(
    CidrBlock="10.0.0.0/16",
    AmazonProvidedIpv6CidrBlock=False,
    InstanceTenancy="default",
    TagSpecifications=[{"ResourceType": "vpc", "Tags": [{"Key": "Name", "Value": "diy-vpc"}]}]
)

response2 = client.modify_vpc_attribute(
    VpcId="preview-vpc-1234",
    EnableDnsHostnames={"Value": True}
)

response3 = client.describe_vpcs(
    VpcIds=["preview-vpc-1234"]
)

response4 = client.create_vpc_endpoint(
    VpcId="preview-vpc-1234",
    ServiceName="com.amazonaws.ap-southeast-2.s3",
    TagSpecifications=[{"ResourceType": "vpc-endpoint", "Tags": [{"Key": "Name", "Value": "diy-vpce-s3"}]}]
)

response5 = client.create_subnet(
    VpcId="preview-vpc-1234",
    CidrBlock="10.0.144.0/20",
    AvailabilityZone="ap-southeast-2b",
    Ipv6CidrBlock=None,
    TagSpecifications=[{"ResourceType": "subnet", "Tags": [{"Key": "Name", "Value": "diy-subnet-private2-ap-southeast-2b"}]}]
)

response6 = client.create_internet_gateway(
    TagSpecifications=[{"ResourceType": "internet-gateway", "Tags": [{"Key": "Name", "Value": "diy-igw"}]}]
)

response7 = client.attach_internet_gateway(
    InternetGatewayId="preview-igw-1234",
    VpcId="preview-vpc-1234"
)

response8 = client.create_route_table(
    VpcId="preview-vpc-1234",
    TagSpecifications=[{"ResourceType": "route-table", "Tags": [{"Key": "Name", "Value": "diy-rtb-private2-ap-southeast-2b"}]}]
)

response9 = client.create_route(
    RouteTableId="preview-rtb-public-0",
    DestinationCidrBlock="0.0.0.0/0",
    GatewayId="preview-igw-1234"
)

response10 = client.associate_route_table(
    RouteTableId="preview-rtb-private-2",
    SubnetId="preview-subnet-private-3"
)

response11 = client.describe_route_tables(
    RouteTableIds=["preview-rtb-public-0", "preview-rtb-private-1", "preview-rtb-private-2"]
)

response12 = client.modify_vpc_endpoint(
    VpcEndpointId="preview-vpce-1234",
    AddRouteTableIds=["preview-rtb-private-1", "preview-rtb-private-2"]
)
