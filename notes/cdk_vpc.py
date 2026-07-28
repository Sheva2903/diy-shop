
# Import the necessary classes
import aws_cdk as cdk
from aws_cdk import (
    Stack,
    Tags,
    CfnOutput
)
from constructs import Construct
from typing import List, Dict, Optional, Any
import aws_cdk.aws_ec2 as ec2

# Define constants from CLI command parameters
VPC_CIDR_BLOCK: str = "10.0.0.0/16"
VPC_NAME: str = "diy-vpc"
VPC_INSTANCE_TENANCY: str = "default"
SUBNET_CIDR_BLOCK: str = "10.0.144.0/20"
SUBNET_AVAILABILITY_ZONE: str = "ap-southeast-2b"
SUBNET_NAME: str = "diy-subnet-private2-ap-southeast-2b"
IGW_NAME: str = "diy-igw"
ROUTE_TABLE_NAME: str = "diy-rtb-private2-ap-southeast-2b"
VPC_ENDPOINT_SERVICE_NAME: str = "com.amazonaws.ap-southeast-2.s3"
VPC_ENDPOINT_NAME: str = "diy-vpce-s3"
ROUTE_DESTINATION_CIDR: str = "0.0.0.0/0"


class NetworkInfrastructureStack(Stack):
    """
    CDK Stack to create VPC networking infrastructure based on AWS CLI commands.
    This stack creates a VPC with subnets, internet gateway, route tables, and VPC endpoints.
    """

    def __init__(self, scope: Construct, construct_id: str, **kwargs: Any) -> None:
        super().__init__(scope, construct_id, **kwargs)

        try:
            # Step 1: Create VPC with specified CIDR block and instance tenancy
            # This corresponds to: aws ec2 create-vpc command
            vpc = ec2.CfnVPC(
                self,
                "DiyVpc",
                cidr_block=VPC_CIDR_BLOCK,
                enable_dns_hostnames=True,  # Corresponds to modify-vpc-attribute command
                enable_dns_support=True,
                instance_tenancy=VPC_INSTANCE_TENANCY
            )
            
            # Add Name tag to VPC
            Tags.of(vpc).add("Name", VPC_NAME)

            # Step 2: Create Internet Gateway
            # This corresponds to: aws ec2 create-internet-gateway command
            internet_gateway = ec2.CfnInternetGateway(
                self,
                "DiyInternetGateway"
            )
            
            # Add Name tag to Internet Gateway
            Tags.of(internet_gateway).add("Name", IGW_NAME)

            # Step 3: Attach Internet Gateway to VPC
            # This corresponds to: aws ec2 attach-internet-gateway command
            igw_attachment = ec2.CfnVPCGatewayAttachment(
                self,
                "DiyIgwAttachment",
                vpc_id=vpc.ref,
                internet_gateway_id=internet_gateway.ref
            )

            # Step 4: Create Subnet in the VPC
            # This corresponds to: aws ec2 create-subnet command
            subnet = ec2.CfnSubnet(
                self,
                "DiyPrivateSubnet2",
                vpc_id=vpc.ref,
                cidr_block=SUBNET_CIDR_BLOCK,
                availability_zone=SUBNET_AVAILABILITY_ZONE
            )
            
            # Add Name tag to Subnet
            Tags.of(subnet).add("Name", SUBNET_NAME)

            # Step 5: Create Route Table for the VPC
            # This corresponds to: aws ec2 create-route-table command
            route_table = ec2.CfnRouteTable(
                self,
                "DiyPrivateRouteTable2",
                vpc_id=vpc.ref
            )
            
            # Add Name tag to Route Table
            Tags.of(route_table).add("Name", ROUTE_TABLE_NAME)

            # Step 6: Create default route to Internet Gateway
            # This corresponds to: aws ec2 create-route command
            default_route = ec2.CfnRoute(
                self,
                "DiyDefaultRoute",
                route_table_id=route_table.ref,
                destination_cidr_block=ROUTE_DESTINATION_CIDR,
                gateway_id=internet_gateway.ref
            )
            
            # Ensure route is created after IGW attachment
            default_route.add_dependency(igw_attachment)

            # Step 7: Create VPC Endpoint for S3
            # This corresponds to: aws ec2 create-vpc-endpoint command
            # Note: The modify-vpc-endpoint command references route tables that need to exist
            vpc_endpoint = ec2.CfnVPCEndpoint(
                self,
                "DiyS3VpcEndpoint",
                vpc_id=vpc.ref,
                service_name=VPC_ENDPOINT_SERVICE_NAME,
                vpc_endpoint_type="Gateway",
                route_table_ids=[route_table.ref]  # Corresponds to modify-vpc-endpoint add-route-table-ids
            )
            
            # Add Name tag to VPC Endpoint
            Tags.of(vpc_endpoint).add("Name", VPC_ENDPOINT_NAME)

            # Output the created resource IDs for reference
            CfnOutput(
                self,
                "VpcId",
                value=vpc.ref,
                description="VPC ID"
            )
            
            CfnOutput(
                self,
                "InternetGatewayId",
                value=internet_gateway.ref,
                description="Internet Gateway ID"
            )
            
            CfnOutput(
                self,
                "SubnetId",
                value=subnet.ref,
                description="Subnet ID"
            )
            
            CfnOutput(
                self,
                "RouteTableId",
                value=route_table.ref,
                description="Route Table ID"
            )
            
            CfnOutput(
                self,
                "VpcEndpointId",
                value=vpc_endpoint.ref,
                description="VPC Endpoint ID"
            )

        except Exception as e:
            raise RuntimeError(f"Error creating network infrastructure: {str(e)}")


# Entry point for the CDK application
if __name__ == "__main__":
    app = cdk.App()
    
    # Create the stack with appropriate environment configuration
    NetworkInfrastructureStack(
        app,
        "NetworkInfrastructureStack",
        env=cdk.Environment(
            region="ap-southeast-2"  # Region derived from CLI commands
        ),
        description="Network infrastructure stack with VPC, subnets, IGW, route tables, and VPC endpoints"
    )
    
    app.synth()
